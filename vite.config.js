import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom Vite Plugin to simulate Vercel API Routes locally during 'npm run dev'
const vercelApiProxy = () => ({
  name: 'vercel-api-proxy',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url === '/api/stripe' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const parsed = JSON.parse(body);
            const stripeKey = parsed.stripeKey;
            
            if (!stripeKey) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ error: 'Missing stripeKey' }));
            }
            
            const response = await fetch('https://api.stripe.com/v1/charges?limit=100', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${stripeKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            });
            
            const data = await response.json();
            res.setHeader('Content-Type', 'application/json');
            
            if (!response.ok) {
               res.statusCode = response.status;
               return res.end(JSON.stringify({ error: data.error?.message || 'Stripe API Error' }));
            }
            
            res.statusCode = 200;
            res.end(JSON.stringify(data));
          } catch(e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Local Proxy Error: ' + e.message }));
          }
        });
        return;
      }

      // ManyChat API Proxy
      if (req.url === '/api/manychat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const parsed = JSON.parse(body);
            const { apiKey, action = 'getPageInfo', params = {} } = parsed;

            if (!apiKey) {
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Missing ManyChat API Key' }));
            }

            const ENDPOINTS = {
              getPageInfo:       { method: 'GET',  path: '/fb/page/getInfo' },
              getTags:           { method: 'GET',  path: '/fb/page/getTags' },
              getFlows:          { method: 'GET',  path: '/fb/page/getFlows' },
              getCustomFields:   { method: 'GET',  path: '/fb/page/getCustomFields' },
              getGrowthTools:    { method: 'GET',  path: '/fb/page/getGrowthTools' },
              getBotFields:      { method: 'GET',  path: '/fb/page/getBotFields' },
              getSubscriberInfo: { method: 'GET',  path: '/fb/subscriber/getInfo' },
              findByName:        { method: 'GET',  path: '/fb/subscriber/findByName' },
              findBySystemField: { method: 'GET',  path: '/fb/subscriber/findBySystemField' },
              findByCustomField: { method: 'GET',  path: '/fb/subscriber/findByCustomField' },
              createSubscriber:  { method: 'POST', path: '/fb/subscriber/createSubscriber' },
              updateSubscriber:  { method: 'POST', path: '/fb/subscriber/updateSubscriber' },
              addTag:            { method: 'POST', path: '/fb/subscriber/addTag' },
              addTagByName:      { method: 'POST', path: '/fb/subscriber/addTagByName' },
              removeTag:         { method: 'POST', path: '/fb/subscriber/removeTag' },
              removeTagByName:   { method: 'POST', path: '/fb/subscriber/removeTagByName' },
              setCustomField:    { method: 'POST', path: '/fb/subscriber/setCustomField' },
              setCustomFieldByName: { method: 'POST', path: '/fb/subscriber/setCustomFieldByName' },
              sendContent:       { method: 'POST', path: '/fb/sending/sendContent' },
              sendFlow:          { method: 'POST', path: '/fb/sending/sendFlow' },
              createTag:         { method: 'POST', path: '/fb/page/createTag' },
            };

            const endpoint = ENDPOINTS[action];
            if (!endpoint) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: `Unknown action: ${action}` }));
            }

            const BASE_URL = 'https://api.manychat.com';
            let url = BASE_URL + endpoint.path;
            const fetchOpts = {
              method: endpoint.method,
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            };

            if (endpoint.method === 'GET' && params && Object.keys(params).length > 0) {
              url += '?' + new URLSearchParams(params).toString();
            } else if (endpoint.method === 'POST' && params && Object.keys(params).length > 0) {
              fetchOpts.body = JSON.stringify(params);
            }

            const mcRes = await fetch(url, fetchOpts);
            const data = await mcRes.json();
            res.setHeader('Content-Type', 'application/json');

            if (!mcRes.ok) {
              res.statusCode = mcRes.status;
              return res.end(JSON.stringify({ error: data.message || 'ManyChat API Error', details: data.details }));
            }

            res.statusCode = 200;
            res.end(JSON.stringify(data));
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Local ManyChat Proxy Error: ' + e.message }));
          }
        });
        return;
      }

      next();
    });
  }
});

export default defineConfig({
  plugins: [react(), vercelApiProxy()],
})
