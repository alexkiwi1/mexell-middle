# Frigate Middleware API - Troubleshooting Guide

## 🔧 "Couldn't connect to server" Error

### Quick Fix

**Use the correct URL in Insomnia:**
- **Development**: `http://10.100.6.2:5002` (NOT localhost)
- **Production**: `http://10.100.6.2:5002`

### Why localhost doesn't work

- The API is running on the server at `10.100.6.2`
- `localhost` only works when testing from the same machine
- You're testing from your PC, so you need the server's IP address

---

## 🧪 Test URLs

### From Your PC (Insomnia)

**✅ Correct URLs:**
```
http://10.100.6.2:5002/v1/health
http://10.100.6.2:5002/v1/
http://10.100.6.2:5002/v1/api/info
http://10.100.6.2:5002/v1/api/cameras/list
http://10.100.6.2:5002/v1/api/recent-media/recordings?limit=5
```

**❌ Wrong URLs:**
```
http://localhost:5002/v1/health  ← Only works on server
http://127.0.0.1:5002/v1/health  ← Only works on server
```

### From Server (Terminal)

**✅ Correct URLs:**
```
http://localhost:5002/v1/health
http://10.100.6.2:5002/v1/health
```

---

## 🔍 Connection Troubleshooting

### Step 1: Check Server Status

**On the server, run:**
```bash
# Check if containers are running
docker compose ps

# Test API locally
curl http://localhost:5002/v1/health

# Test API externally
curl http://10.100.6.2:5002/v1/health
```

### Step 2: Check Network Connectivity

**From your PC, test:**
```bash
# Test if server is reachable
ping 10.100.6.2

# Test if port 5002 is open
telnet 10.100.6.2 5002

# Test API directly
curl http://10.100.6.2:5002/v1/health
```

### Step 3: Check Firewall

**On the server, check:**
```bash
# Check if port 5002 is listening
netstat -tlnp | grep 5002

# Check firewall rules
ufw status
# or
iptables -L
```

---

## 🚀 Quick Start Guide

### 1. Import Insomnia Collection

1. Download `insomnia-automated-tests.json`
2. Open Insomnia
3. Import → From File
4. Select the JSON file

### 2. Set Correct Environment

1. In Insomnia, click the environment dropdown
2. Select "Production Environment" (uses 10.100.6.2:5002)
3. Or manually change base_url to `http://10.100.6.2:5002`

### 3. Test Connection

1. Run "1.1 Health Check" request
2. Should return 200 OK with database connected
3. If it works, all other tests should work

---

## 📋 Common Issues & Solutions

### Issue: "Couldn't connect to server"

**Cause**: Using localhost instead of server IP
**Solution**: Use `http://10.100.6.2:5002`

### Issue: "Connection refused"

**Cause**: Server not running or port blocked
**Solution**: 
1. Check `docker compose ps` on server
2. Check firewall settings
3. Verify port 5002 is open

### Issue: "Timeout"

**Cause**: Network connectivity issues
**Solution**:
1. Check if you can ping 10.100.6.2
2. Check if port 5002 is accessible
3. Check network routing

### Issue: "404 Not Found"

**Cause**: Wrong URL path
**Solution**: Use correct API paths:
- Health: `/v1/health`
- Cameras: `/v1/api/cameras/list`
- Media: `/v1/api/recent-media/recordings`

---

## 🔧 Server Configuration

### Current Setup

- **Server IP**: 10.100.6.2
- **API Port**: 5002
- **Database**: 10.0.20.6:5433
- **Video Server**: 10.0.20.6:8000

### Docker Configuration

```yaml
ports:
  - '5002:5002'  # Maps host port 5002 to container port 5002
```

This makes the API accessible on `10.100.6.2:5002`

---

## ✅ Verification Steps

### 1. Server Side (Run these on the server)

```bash
# Check containers
docker compose ps

# Test local connection
curl http://localhost:5002/v1/health

# Test external connection
curl http://10.100.6.2:5002/v1/health
```

### 2. Client Side (Run these from your PC)

```bash
# Test server reachability
ping 10.100.6.2

# Test API connection
curl http://10.100.6.2:5002/v1/health
```

### 3. Insomnia Testing

1. Import the test collection
2. Set environment to "Production Environment"
3. Run "1.1 Health Check"
4. Should see 200 OK response

---

## 🎯 Expected Results

**Health Check Response:**
```json
{
  "success": true,
  "message": "All services healthy",
  "data": {
    "status": "healthy",
    "services": {
      "frigate_database": {
        "status": "connected",
        "host": "10.0.20.6"
      }
    }
  }
}
```

**If you see this, everything is working correctly!** 🎉

---

## 📞 Need Help?

If you're still having issues:

1. **Check server logs**: `docker compose logs node-app`
2. **Verify network**: Can you ping 10.100.6.2 from your PC?
3. **Test with curl**: Try the curl commands above
4. **Check firewall**: Make sure port 5002 is open

The API is working correctly on the server - the issue is just using the right URL from your PC!

