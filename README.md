# Summit 2024

The **Summit** project is a full-stack Kubernetes-based application that uses **Terraform** for provisioning the infrastructure and **Helm** for managing Kubernetes deployments. The project demonstrates a microservices architecture and showcases various services and their interactions through the `projectfiles` folder.

## Project Overview

This project is designed to deploy a Kubernetes cluster, manage applications using Helm, and demonstrate the deployment of various microservices. It is structured as follows:

1. **Kubernetes Cluster with Terraform**:
   - The **Cluster** folder contains Terraform configurations that automate the setup of a Kubernetes cluster. These configurations provision the necessary infrastructure for deploying the application.
   
2. **Helm Application (`krushigowrava`)**:
   - The **krushigowrava** folder contains a Helm chart that defines how the application is deployed on the Kubernetes cluster. The Helm chart includes Kubernetes manifests and configurations for services like frontend, OAuth, and product services.

3. **Projectiles Folder (`projectfiles`)**:
   - The **projectfiles** folder contains the microservices for the project. This includes the source code, configuration files, and any additional resources needed for services like `frontend`, `oauth`, and `shopping`.

## Project Directory Structure

```
.
├── Cluster/                  # Terraform configuration for Kubernetes cluster setup
│   ├── main.tf               # Main Terraform configuration
│   ├── variables.tf          # Variables used for Terraform setup
│   └── outputs.tf            # Terraform output configuration
│
├── krushigowrava/            # Helm chart for the Kubernetes application
│   ├── Chart.yaml            # Metadata for the Helm chart
│   ├── values.yaml           # Helm chart configuration values
│   └── templates/            # Kubernetes deployment templates
│       ├── frontend-deployment.yaml
│       ├── grafana-deployment.yaml
│       ├── oauth-service.yaml
│       ├── products-service.yaml
│       ├── frontend-service.yaml
│       ├── oauth-deployment.yaml
│       ├── products-deployment.yaml
│       └── prometheus-deployment.yaml
│
├── projectfiles/             # Microservices and project-related files
│   ├── compose.yml           # Docker Compose configuration (for local testing)
│   ├── frontend/             # Frontend microservice
│   │   └── ...
│   ├── oauth/                # OAuth microservice
│   │   └── ...
│   └── shopping/             # Shopping microservice
│       └── ...
└── README.md                 # Project documentation
```

## Components

### 1. **Cluster (Terraform)**

The **Cluster** folder contains Terraform files that automate the provisioning of a Kubernetes cluster. These files ensure that the necessary infrastructure is set up to host your application on Kubernetes. The key Terraform files include:

- `main.tf`: The main configuration for setting up the Kubernetes cluster and associated resources.
- `variables.tf`: Variables to parameterize the Terraform configuration.
- `outputs.tf`: Outputs used to display relevant information about the infrastructure after provisioning.

### 2. **krushigowrava (Helm Application)**

The **krushigowrava** folder contains the Helm chart, which is used to deploy the application on the Kubernetes cluster. Helm allows you to package Kubernetes applications and easily manage their lifecycle. The key components of this folder include:

- `Chart.yaml`: Metadata file for the Helm chart.
- `values.yaml`: Configuration values for customizing the deployment (e.g., resource limits, environment variables).
- `templates/`: Contains Kubernetes YAML templates for services and deployments.
  - **`frontend-deployment.yaml`**: Defines the deployment for the frontend service.
  - **`oauth-deployment.yaml`**: Defines the deployment for the OAuth service.
  - **`products-deployment.yaml`**: Defines the deployment for the products service.
  - Additional templates for other services like Grafana, Prometheus, and frontend/backend services.

You can use Helm to install, upgrade, and manage the deployment of the application defined in this chart.

### 3. **projectfiles (Microservices)**

The **projectfiles** folder contains individual projects that implement the microservices architecture of the application. Each folder contains code and configurations for a particular service:

- **`frontend/`**: Contains the code and configuration files for the frontend service.
- **`oauth/`**: Contains the code and configuration files for the OAuth authentication service.
- **`shopping/`**: Contains the code and configuration files for the shopping service.
- **`compose.yml`**: A Docker Compose configuration for setting up services locally (optional).

These services are designed to run within the Kubernetes cluster and are deployed using Helm.

## Getting Started

Follow these steps to get started with the project.

### Prerequisites

Before you begin, ensure you have the following installed:

- **Terraform** (v5.85.0 or later)
- **Helm**
- **Kubernetes** (A running Kubernetes cluster or use Terraform to provision one)
- **Docker** (for building and running containers locally)

### Step 1: Set Up the Kubernetes Cluster with Terraform

1. Clone the repository:
   ```bash
   git clone https://github.com/gani-23/summit.git
   cd summit/Cluster ```
2. Initialize Terraform:
   ```bash
   terraform init
   ```

3. Apply the Terraform configuration to provision the Kubernetes cluster:
   ```bash
   terraform apply
   ```
   This command will create the necessary resources and output information for accessing the Kubernetes cluster.

### Step 2: Install Helm Application

1. Navigate to the Helm chart directory:
   ```bash
   cd ../krushigowrava
   ```

2. Install the application using Helm:
   ```bash
   helm install krushigowrava .
   ```
   This will deploy the Kubernetes application as defined in the Helm chart.

### Step 3: Explore Microservices

1. Navigate to the project files directory:
   ```bash
   cd ../projectfiles
   ```

2. Explore the source code and configurations for each service:
   - `frontend/`: Frontend microservice
   - `oauth/`: Authentication and authorization service
   - `shopping/`: Shopping microservice

3. Local Development with Docker Compose:
   ```bash
   docker-compose -f compose.yml up
   ```

## Kubernetes Cluster Management

### Basic Kubectl Commands

* View status of deployed resources:
  ```bash
  kubectl get all
  ```

* View logs for a specific pod:
  ```bash
  kubectl logs <pod-name>
  ```

* Scale a service:
  1. Update `values.yaml` in the Helm chart
  2. Apply changes:
     ```bash
     helm upgrade krushigowrava .
     ```
## Jaeger Metrics Hosting 

```
# Command to run Jaeger using docker 

sudo docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -p 5775:5775/udp \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 14250:14250 \
  -p 14268:14268 \
  -p 14269:14269 \
  -p 9411:9411 \
  jaegertracing/all-in-one:1.22
```

## Monitoring and Observability

The project includes monitoring tools:
- **Grafana**: Visualization and monitoring dashboards
- **Prometheus**: Metrics collection and alerting
- ** Jaeger Metrics **: Metrics Visualisation

Access these services using kubectl port-forward or through your cluster's ingress configuration.

## Local Development

### Running Services Locally
Use Docker Compose for local development and testing:
```bash
docker-compose -f projectfiles/compose.yml up
```

### Debugging
- Check service logs
- Use kubectl describe for detailed resource information
- Verify network configurations and service connections

## Contributing

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/YourFeatureName
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/YourFeatureName
   ```
5. Open a Pull Request

### Contribution Guidelines
- Follow existing code structure
- Add tests for new features
- Update documentation
- Ensure code passes all CI checks

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgements

Special thanks to the open-source community and the following technologies:
- Terraform
- Kubernetes
- Helm
- Docker
- Prometheus
- Grafana

## Contact

For questions or support, please open an issue on the GitHub repository.

Project Link: [https://github.com/gani-23/summit](https://github.com/gani-23/summit/projectfiles/krushigowrava)

