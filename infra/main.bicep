// Main Bicep template for Tanks Game Azure deployment
// Deploys: Container Registry, Container Apps Environment, Client App, Server App

@description('Base name for all resources')
param baseName string = 'tanks'

@description('Azure region for resources')
param location string = resourceGroup().location

@description('Container image tag')
param imageTag string = 'latest'

@description('Minimum number of server replicas')
@minValue(1)
@maxValue(10)
param serverMinReplicas int = 1

@description('Maximum number of server replicas')
@minValue(1)
@maxValue(10)
param serverMaxReplicas int = 3

// Generate unique suffix for globally unique names
var uniqueSuffix = uniqueString(resourceGroup().id)
var acrName = '${baseName}acr${uniqueSuffix}'
var environmentName = '${baseName}-env'
var serverAppName = '${baseName}-server'
var clientAppName = '${baseName}-client'
var logAnalyticsName = '${baseName}-logs'

// Log Analytics Workspace (required for Container Apps)
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// Azure Container Registry
resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

// Container Apps Environment
resource containerAppsEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: environmentName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// Game Server Container App
resource serverApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: serverAppName
  location: location
  properties: {
    managedEnvironmentId: containerAppsEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
        // Sticky sessions required for WebSocket/Colyseus
        stickySessions: {
          affinity: 'sticky'
        }
        corsPolicy: {
          allowedOrigins: [
            'https://${clientAppName}.${containerAppsEnv.properties.defaultDomain}'
            'http://localhost:*'
          ]
          allowedMethods: ['GET', 'POST', 'OPTIONS']
          allowedHeaders: ['*']
          allowCredentials: true
        }
      }
      registries: [
        {
          server: acr.properties.loginServer
          username: acr.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: acr.listCredentials().passwords[0].value
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'server'
          image: '${acr.properties.loginServer}/${baseName}-server:${imageTag}'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'PORT'
              value: '3000'
            }
            {
              name: 'CORS_ORIGIN'
              value: 'https://${clientAppName}.${containerAppsEnv.properties.defaultDomain}'
            }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/health'
                port: 3000
              }
              initialDelaySeconds: 10
              periodSeconds: 30
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/health'
                port: 3000
              }
              initialDelaySeconds: 5
              periodSeconds: 10
            }
          ]
        }
      ]
      scale: {
        minReplicas: serverMinReplicas
        maxReplicas: serverMaxReplicas
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '50'
              }
            }
          }
        ]
      }
    }
  }
}

// Web Client Container App
resource clientApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: clientAppName
  location: location
  properties: {
    managedEnvironmentId: containerAppsEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 80
        transport: 'http'
      }
      registries: [
        {
          server: acr.properties.loginServer
          username: acr.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: acr.listCredentials().passwords[0].value
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'client'
          image: '${acr.properties.loginServer}/${baseName}-client:${imageTag}'
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/health'
                port: 80
              }
              periodSeconds: 30
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
    }
  }
}

// Outputs
output acrLoginServer string = acr.properties.loginServer
output acrName string = acr.name
output serverUrl string = 'https://${serverApp.properties.configuration.ingress.fqdn}'
output clientUrl string = 'https://${clientApp.properties.configuration.ingress.fqdn}'
output environmentName string = containerAppsEnv.name
