# Movie-Verse Infrastructure

Infrastructure as Code (IaC) for deploying Movie-Verse on AWS using Terraform and Kubernetes.

## 📋 Overview

This directory contains all infrastructure configuration for deploying Movie-Verse in AWS cloud:

- **Terraform**: Infrastructure provisioning (VPC, EKS, networking)
- **Kubernetes**: Application deployment and orchestration
- **AWS Services**: EKS, VPC, ALB, Route53, S3

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS Cloud                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                      VPC                               │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │            Private Subnet                        │  │  │
│  │  │  ┌──────────────────────────────────────────┐   │  │  │
│  │  │  │          EKS Cluster                      │   │  │  │
│  │  │  │  ┌────────────┐  ┌────────────┐          │   │  │  │
│  │  │  │  │ App Pod 1  │  │ App Pod 2  │  ...     │   │  │  │
│  │  │  │  └────────────┘  └────────────┘          │   │  │  │
│  │  │  │  ┌────────────┐                          │   │  │  │
│  │  │  │  │  Neo4j Pod │                          │   │  │  │
│  │  │  │  └────────────┘                          │   │  │  │
│  │  │  │       │                                   │   │  │  │
│  │  │  │       └─────> EBS Volume                 │   │  │  │
│  │  │  │                                           │   │  │  │
│  │  │  │  ┌────────────────────────────┐          │   │  │  │
│  │  │  │  │ Horizontal Pod Autoscaler  │          │   │  │  │
│  │  │  │  └────────────────────────────┘          │   │  │  │
│  │  │  └──────────────────────────────────────────┘   │  │  │
│  │  │                                                   │  │  │
│  │  │  ┌──────────────────────────────────────────┐   │  │  │
│  │  │  │         Lambda Function                   │   │  │  │
│  │  │  └──────────────────────────────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │         │                                               │  │
│  │         ├──> Application Load Balancer                 │  │
│  │         │                                               │  │
│  └─────────┼───────────────────────────────────────────────┘  │
│            │                                                   │
│            ├──> Route 53 (DNS)                                │
│            │                                                   │
│            └──> S3 (Static Assets)                            │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                         │
                         ▼
                    End Users
```

## 📁 Directory Structure

```
infra/
├── terraform/                  # Terraform configurations
│   ├── modules/                # Reusable Terraform modules
│   │   ├── vpc/                # VPC module
│   │   │   ├── main.tf         # VPC resources
│   │   │   └── outputs.tf      # VPC outputs
│   │   └── eks/                # EKS module
│   │       ├── main.tf         # EKS cluster resources
│   │       └── variables.tf    # EKS variables
│   └── envs/                   # Environment-specific configs
│       └── dev/                # Development environment
│           ├── main.tf         # Main configuration
│           └── variables.tf    # Environment variables
│
└── k8s/                        # Kubernetes manifests
    └── base/                   # Base configurations
        ├── namespace.yaml      # Namespace definition
        ├── ingress.yaml        # Ingress controller
        ├── app/                # Application configs
        │   ├── deployment.yaml # App deployment
        │   ├── service.yaml    # App service
        │   └── configmap.yaml  # App configuration
        └── databases/          # Database configs
            └── neo4j/          # Neo4j database
                ├── deployment.yaml
                ├── service.yaml
                ├── configmap.yaml
                ├── secret.yaml
                └── pvc.yaml
```

## 🚀 Getting Started

### Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured
- Terraform >= 1.0
- kubectl
- Helm (optional, for some deployments)

### AWS Credentials

```bash
# Configure AWS CLI
aws configure

# Verify credentials
aws sts get-caller-identity
```

## 📦 Terraform Deployment

### Initialize Terraform

```bash
cd terraform/envs/dev
terraform init
```

### Plan Infrastructure

```bash
# Preview changes
terraform plan

# Save plan to file
terraform plan -out=tfplan
```

### Apply Infrastructure

```bash
# Apply changes
terraform apply

# Auto-approve (use with caution)
terraform apply -auto-approve

# Apply specific plan
terraform apply tfplan
```

### Outputs

After applying, Terraform will output:
- VPC ID
- Subnet IDs
- EKS Cluster name
- EKS Cluster endpoint

### Destroy Infrastructure

```bash
# Destroy all resources
terraform destroy

# Auto-approve (use with caution)
terraform destroy -auto-approve
```

## 🎯 Terraform Modules

### VPC Module

Creates a Virtual Private Cloud with:
- Public and private subnets
- Internet Gateway
- NAT Gateway
- Route tables
- Security groups

**Outputs:**
- `vpc_id`: VPC identifier
- `private_subnet_ids`: List of private subnet IDs
- `public_subnet_ids`: List of public subnet IDs

### EKS Module

Creates an EKS cluster with:
- EKS control plane
- Node groups
- IAM roles and policies
- Security groups

**Inputs:**
- `private_subnet_ids`: Private subnets for worker nodes

**Outputs:**
- `cluster_name`: EKS cluster name
- `cluster_endpoint`: EKS cluster endpoint
- `cluster_security_group_id`: Security group ID

## ☸️ Kubernetes Deployment

### Configure kubectl

```bash
# Update kubeconfig
aws eks update-kubeconfig --name <cluster-name> --region us-east-1

# Verify connection
kubectl cluster-info
kubectl get nodes
```

### Deploy Application

#### 1. Create Namespace

```bash
kubectl apply -f k8s/base/namespace.yaml
```

#### 2. Deploy Neo4j Database

```bash
# Apply all Neo4j resources
kubectl apply -f k8s/base/databases/neo4j/

# Verify deployment
kubectl get pods -n movie-verse -l app=neo4j
kubectl get pvc -n movie-verse

# Check logs
kubectl logs -f deployment/neo4j -n movie-verse
```

#### 3. Deploy Application

```bash
# Apply app resources
kubectl apply -f k8s/base/app/

# Verify deployment
kubectl get pods -n movie-verse -l app=app
kubectl get svc -n movie-verse

# Check logs
kubectl logs -f deployment/app -n movie-verse
```

#### 4. Deploy Ingress

```bash
# Apply ingress
kubectl apply -f k8s/base/ingress.yaml

# Get ingress address
kubectl get ingress -n movie-verse
```

### Verify Deployment

```bash
# Check all resources
kubectl get all -n movie-verse

# Check pod status
kubectl get pods -n movie-verse

# Describe pod
kubectl describe pod <pod-name> -n movie-verse

# View logs
kubectl logs <pod-name> -n movie-verse

# Execute command in pod
kubectl exec -it <pod-name> -n movie-verse -- /bin/sh
```

## 📊 Resource Specifications

### Application Deployment

- **Replicas**: 3
- **CPU Request**: 500m (0.5 cores)
- **CPU Limit**: 500m
- **Memory Request**: 1Gi
- **Memory Limit**: 1Gi
- **Container Port**: 3000

### Neo4j Database

- **Replicas**: 1 (StatefulSet recommended for production)
- **Persistent Volume**: Required
- **CPU**: As needed
- **Memory**: Depends on data size
- **Ports**: 7474 (HTTP), 7687 (Bolt)

### Horizontal Pod Autoscaler

- **Min Replicas**: 3
- **Max Replicas**: 10
- **Target CPU**: 70%

## 🔧 Configuration

### ConfigMaps

**App ConfigMap** (`k8s/base/app/configmap.yaml`):
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app
  namespace: movie-verse
data:
  PORT: "3000"
  NODE_ENV: "production"
  NEO4J_URI: "bolt://neo4j:7687"
```

**Neo4j ConfigMap** (`k8s/base/databases/neo4j/configmap.yaml`):
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: neo4j
  namespace: movie-verse
data:
  user: "neo4j"
```

### Secrets

**Neo4j Secret** (`k8s/base/databases/neo4j/secret.yaml`):
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: neo4j-pass
  namespace: movie-verse
type: Opaque
data:
  password: <base64-encoded-password>
```

Create base64 encoded password:
```bash
echo -n "your-password" | base64
```

## 🔄 Scaling

### Manual Scaling

```bash
# Scale app deployment
kubectl scale deployment app --replicas=5 -n movie-verse

# Verify scaling
kubectl get pods -n movie-verse
```

### Auto-scaling

HPA is configured to scale between 3-10 pods based on CPU usage (70%).

```bash
# Check HPA status
kubectl get hpa -n movie-verse

# Describe HPA
kubectl describe hpa app-hpa -n movie-verse
```

## 🔍 Monitoring

### View Logs

```bash
# App logs
kubectl logs -f deployment/app -n movie-verse

# Neo4j logs
kubectl logs -f deployment/neo4j -n movie-verse

# Previous logs (if pod crashed)
kubectl logs --previous <pod-name> -n movie-verse
```

### Resource Usage

```bash
# Node resource usage
kubectl top nodes

# Pod resource usage
kubectl top pods -n movie-verse

# Resource quotas
kubectl describe resourcequota -n movie-verse
```

### Events

```bash
# View events
kubectl get events -n movie-verse

# Watch events
kubectl get events -n movie-verse --watch
```

## 🛡️ Security

### Network Policies

- Private subnets for worker nodes
- Security groups for pod communication
- Ingress controller for external access

### Secrets Management

- Kubernetes Secrets for sensitive data
- AWS Secrets Manager (optional, for production)
- Environment variables from ConfigMaps

### IAM Roles

- EKS cluster role
- Node group role
- Service account roles (IRSA)

## 🔄 Updates and Rollbacks

### Update Deployment

```bash
# Update image
kubectl set image deployment/app app=new-image:tag -n movie-verse

# Check rollout status
kubectl rollout status deployment/app -n movie-verse
```

### Rollback

```bash
# View rollout history
kubectl rollout history deployment/app -n movie-verse

# Rollback to previous version
kubectl rollout undo deployment/app -n movie-verse

# Rollback to specific revision
kubectl rollout undo deployment/app --to-revision=2 -n movie-verse
```

## 🧪 Testing

### Test Application Connectivity

```bash
# Port forward to local machine
kubectl port-forward svc/app 3000:3000 -n movie-verse

# Test API
curl http://localhost:3000/graphql
```

### Test Neo4j Connectivity

```bash
# Port forward Neo4j
kubectl port-forward svc/neo4j 7687:7687 -n movie-verse

# Connect with Neo4j browser
# Open http://localhost:7474
```

## 🐛 Troubleshooting

### Pod Not Starting

```bash
# Describe pod
kubectl describe pod <pod-name> -n movie-verse

# Check events
kubectl get events -n movie-verse --sort-by='.lastTimestamp'

# Check logs
kubectl logs <pod-name> -n movie-verse
```

### Network Issues

```bash
# Test DNS
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup neo4j.movie-verse.svc.cluster.local

# Test connectivity
kubectl run -it --rm debug --image=busybox --restart=Never -- wget -O- http://app:3000
```

### Storage Issues

```bash
# Check PVC status
kubectl get pvc -n movie-verse

# Describe PVC
kubectl describe pvc <pvc-name> -n movie-verse

# Check storage class
kubectl get storageclass
```

## 💰 Cost Optimization

- Use spot instances for non-critical workloads
- Right-size resources based on actual usage
- Enable cluster autoscaler
- Use HPA for dynamic scaling
- Clean up unused resources

## 📚 Additional Resources

- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Neo4j on Kubernetes](https://neo4j.com/developer/kubernetes/)

## 🤝 Contributing

When adding infrastructure:
1. Use Terraform modules for reusability
2. Follow naming conventions
3. Document all variables and outputs
4. Use resource tags for organization
5. Test in dev environment first

## 📄 License

UNLICENSED

---

**Part of the Movie-Verse project**
