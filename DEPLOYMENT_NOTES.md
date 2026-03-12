# BYKE Backend - Deployment Notes

## AWS EC2 Server Details
| Item | Value |
|------|-------|
| **EC2 Public IP** | `16.170.226.253` |
| **EC2 Region** | `eu-north-1` (Stockholm) |
| **EC2 Instance Type** | `t2.micro` / `t3.micro` |
| **OS** | Ubuntu 24.04 LTS |
| **SSH User** | `ubuntu` |
| **SSH Key File** | `D:\BYKE-SECRETS=PROD\EC2=SECRETS\ec2-byke.pem` |
| **App Directory on Server** | `/opt/byke/` |
| **Docker Hub Username** | `aditya2004123` |
| **Docker Hub Image** | `aditya2004123/byke-backend:latest` |
| **GitHub Repo** | `https://github.com/adityaRaj369/Byke` |

---

## SSH Into Server
```powershell
ssh -i "D:\BYKE-SECRETS=PROD\EC2=SECRETS\ec2-byke.pem" ubuntu@16.170.226.253
```

## Copy a file to Server (from Windows)
```powershell
scp -i "D:\BYKE-SECRETS=PROD\EC2=SECRETS\ec2-byke.pem" <localfile> ubuntu@16.170.226.253:/opt/byke/
```

---

## GitHub Actions Secrets (All 7 Required)

| Secret Name | What it is |
|---|---|
| `DOCKER_USERNAME` | `aditya2004123` (Docker Hub username) |
| `DOCKER_PASSWORD` | Docker Hub password/token |
| `PRODUCTION_HOST` | `16.170.226.253` |
| `PRODUCTION_USER` | `ubuntu` |
| `SSH_PRIVATE_KEY` | Full content of `ec2-byke.pem` file |
| `PRODUCTION_ENV_FILE` | Full content of `backend/.env` file |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Full content of Firebase service account JSON |

> GitHub Secrets location: **Repo → Settings → Secrets and variables → Actions**

---

## How CI/CD Pipeline Works

1. You push code to `main` branch
2. GitHub Actions builds a Docker image and pushes it to Docker Hub as `aditya2004123/byke-backend:latest`
3. GitHub Actions SSHs into EC2 server
4. Creates `/opt/byke/.env` from `PRODUCTION_ENV_FILE` secret
5. Creates `/opt/byke/firebase-service-account.json` from `FIREBASE_SERVICE_ACCOUNT_JSON` secret
6. Runs `docker-compose pull backend` + `docker-compose up -d`
7. Backend is live at `http://16.170.226.253:8080`

---

## Manual Deploy (if GitHub Actions fails)

From your Windows PC, run:
```powershell
# 1. Copy docker-compose.yml to server
scp -i "D:\BYKE-SECRETS=PROD\EC2=SECRETS\ec2-byke.pem" docker-compose.yml ubuntu@16.170.226.253:/opt/byke/

# 2. SSH into server
ssh -i "D:\BYKE-SECRETS=PROD\EC2=SECRETS\ec2-byke.pem" ubuntu@16.170.226.253
```

Then inside the SSH session (Linux terminal):
```bash
cd /opt/byke
docker-compose pull backend
docker-compose up -d
docker ps   # verify containers are running
```

---

## Check Backend Status (inside SSH session)
```bash
docker ps                                         # see running containers
docker-compose logs backend --tail=50             # see backend logs
docker-compose restart backend                    # restart backend only
docker-compose down && docker-compose up -d       # full restart
```

## Verify Backend is Running (from browser or terminal)
```
http://16.170.226.253:8080/swagger-ui.html
```

---

## Services Running via Docker Compose

| Service | Image | Port |
|---|---|---|
| **backend** | `aditya2004123/byke-backend:latest` | `8080` |
| **postgres** | `postgres:15-alpine` | `5432` |
| **redis** | `redis:7-alpine` | `6379` |
| **kafka** | `confluentinc/cp-kafka:7.5.0` | `9092` |
| **zookeeper** | `confluentinc/cp-zookeeper:7.5.0` | `2181` |

---

## Backend Environment Variables (Production)

| Variable | Value / Source |
|---|---|
| `DB_HOST` | `postgres` (docker container name) |
| `REDIS_HOST` | `redis` (docker container name) |
| `KAFKA_SERVERS` | `kafka:9092` |
| `JWT_SECRET` | Long random string (set in `.env`) |
| `FIREBASE_CREDENTIALS_PATH` | `/opt/byke/firebase-service-account.json` |
| `AWS_ACCESS_KEY` | IAM user key (for S3 file uploads) |
| `AWS_SECRET_KEY` | IAM user secret |
| `AWS_S3_BUCKET` | `byke-documents` |
| `AWS_REGION` | `eu-north-1` |
| `GOOGLE_MAPS_API_KEY` | Google Cloud API key |
| Stripe | **DISABLED** — all subscriptions are free for now |

---

## What Was Changed in the Code

| File | Change |
|---|---|
| `backend/src/.../FirebaseOtpService.java` | Fixed Firebase token verification to use `getClaims().get("phone_number")` |
| `backend/src/.../JwtUtil.java` | Updated JJWT API from deprecated `parserBuilder()` to `parser()` |
| `backend/src/.../AuthController.java` | Added missing `FirebaseOtpService` dependency injection |
| `backend/src/.../PaymentService.java` | Removed Stripe — all subscriptions are now FREE |
| `backend/src/.../model/entity/Rider.java` | Added `@Builder.Default` to Lombok fields |
| `backend/src/.../model/entity/User.java` | Added `@Builder.Default` to Lombok fields |
| `backend/src/.../model/entity/Notification.java` | Added `@Builder.Default` to Lombok fields |
| `backend/src/main/resources/application.yml` | Made Stripe config optional, added Firebase credentials path |
| `docker-compose.yml` | Changed backend from `build:` to `image: aditya2004123/byke-backend:latest` |
| `.github/workflows/backend-ci.yml` | Removed gradlew steps, now just builds Docker + deploys via SSH |
| `.gitignore` | Created — prevents `.env` and Firebase JSON from being committed |

---

## AWS Security Group Rules (Port open on EC2)

| Port | Protocol | Use |
|---|---|---|
| `22` | TCP | SSH access |
| `8080` | TCP | Backend API (open to 0.0.0.0/0) |
