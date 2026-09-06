import test from "node:test";
import assert from "node:assert/strict";
import http from "http";
import app from "../src/app.js";
import userModel from "../src/models/user.model.js";

// Helper function to make HTTP requests to the Express app in memory
function makeRequest(app, method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      const opts = {
        hostname: "127.0.0.1",
        port,
        path,
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      };

      const req = http.request(opts, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          server.close();
          let json = null;
          try {
            json = JSON.parse(data);
          } catch (e) {
            json = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        });
      });

      req.on("error", (err) => {
        server.close();
        reject(err);
      });

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  });
}

test("API Register - missing credentials returns 400", async () => {
  const res = await makeRequest(app, "POST", "/api/auth/register", {}, {
    username: "",
    email: "test@example.com",
    password: "password123",
  });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.equal(res.body.message, "Username, email, and password are required");
});

test("API Login - missing credentials returns 400", async () => {
  const res = await makeRequest(app, "POST", "/api/auth/login", {}, {
    email: "",
    password: "",
  });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

test("API Get Me - unauthorized request returns 401", async () => {
  const res = await makeRequest(app, "GET", "/api/auth/get-me");

  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
  assert.equal(res.body.message, "Unauthorized");
});

test("API Search Users - empty query returns empty list", async () => {
  const res = await makeRequest(app, "GET", "/api/auth/users/search?username=");

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.deepEqual(res.body.users, []);
});

test("API Search Users - regex special characters handled safely", async () => {
  const originalFind = userModel.find;
  userModel.find = function () {
    return {
      select: () => ({
        limit: async () => [],
      }),
    };
  };

  try {
    const res = await makeRequest(app, "GET", "/api/auth/users/search?username=[invalid+regex(");
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.deepEqual(res.body.users, []);
  } finally {
    userModel.find = originalFind;
  }
});
