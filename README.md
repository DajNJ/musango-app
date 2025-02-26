
---

## **Musango Express Ticket Management App**

### **Overview**
Musango Express is a web-based ticket booking application that allows users to book and manage their tickets online. The app is built using the following technologies:
- **Backend**: Node.js with Express
- **Frontend**: EJS (Embedded JavaScript templates)
- **Database**: MongoDB
- **Containerization**: Docker

---

## **Prerequisites**
Before running the app, ensure you have the following installed:
1. **Docker**
2. **Docker Compose** (optional, for simplified deployment)

---

## **Steps to Run the App**

### **1. Clone the Repository**
Clone the repository to your local machine:
```bash
git clone https://github.com/HILL-TOPCONSULTANCY/musango-app.git
cd musango-app
```

---

### **2. Set Up Environment Variables**
Create a `.env` file in the root directory and add the following:
```env
MONGO_URI=mongodb://mongodb:27017/musango-express
PORT=8080
```

---

### **3. Build the Docker Image**
Build the Docker image for the Musango Express app:
```bash
docker build -t musango .
```

---

### **4. Run MongoDB in a Docker Container**
Run MongoDB in a Docker container:
```bash
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

---

### **5. Run the Musango Express App**
Run the Musango Express app container and link it to the MongoDB container:
```bash
docker run -d -p 8080:8080 --link mongodb:mongodb -e MONGO_URI=mongodb://mongodb:27017/musango-express musango
```

---

### **6. Access the App**
Open your browser and navigate to:
```
http://localhost:8080
```

---

## **Deploying on Kubernetes**

If you want to deploy the app and MongoDB on Kubernetes, follow these steps:

---

### **1. Prerequisites**
- A running Kubernetes cluster (EKS)
- `kubectl` installed and configured

---

### **2. Create Kubernetes Deployment and Service Files**

#### **MongoDB Deployment and Service**
Create a file named `mongo-deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:latest
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_DATABASE
          value: "musango-express"
---
apiVersion: v1
kind: Service
metadata:
  name: mongodb
spec:
  selector:
    app: mongodb
  ports:
    - protocol: TCP
      port: 27017
      targetPort: 27017
```

#### **Musango Express Deployment and Service**
Create a file named `musango-deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: musango
spec:
  replicas: 1
  selector:
    matchLabels:
      app: musango
  template:
    metadata:
      labels:
        app: musango
    spec:
      containers:
      - name: musango
        image: musango
        ports:
        - containerPort: 8080
        env:
        - name: MONGO_URI
          value: "mongodb://mongodb:27017/musango-express"
        - name: PORT
          value: "8080"
---
apiVersion: v1
kind: Service
metadata:
  name: musango
spec:
  type: NodePort
  selector:
    app: musango
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 8080
      nodePort: 30000
```

---

### **3. Deploy to Kubernetes**
1. Apply the MongoDB deployment and service:
   ```bash
   kubectl apply -f mongo-deployment.yaml
   ```
2. Apply the Musango Express deployment and service:
   ```bash
   kubectl apply -f musango-deployment.yaml
   ```

---

### **4. Access the App**
1. Get the IP address of your Kubernetes cluster:
   - For cloud providers (e.g., GKE, EKS, AKS), use the external IP of the cluster.
2. Access the app using the NodePort:
   ```
   http://<cluster-ip>:30000
   ```

---
