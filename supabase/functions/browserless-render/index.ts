import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, type = 'screenshot', options = {} } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const browserlessApiKey = Deno.env.get('BROWSERLESS_API_KEY');
    if (!browserlessApiKey) {
      return new Response(
        JSON.stringify({ error: 'Browserless API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let endpoint = '';
    let body = {};

    switch (type) {
      case 'screenshot':
        endpoint = 'https://production-sfo.browserless.io/screenshot';
        body = {
          url: url,
          options: {
            ...(options as any).screenshot
          }
        };
        break;
      
      case 'pdf':
        endpoint = 'https://production-sfo.browserless.io/pdf';
        body = {
          url: url,
          options: {
            ...(options as any).pdf
          }
        };
        break;
      
      case 'content':
        endpoint = 'https://production-sfo.browserless.io/content';
        body = {
          url: url
        };
        break;
      
      case 'scrape':
        endpoint = 'https://production-sfo.browserless.io/scrape';
        body = {
          url: url,
          elements: ((options as any).elements || [
            { selector: 'title' },
            { selector: 'h1, h2, h3' },
            { selector: 'body' }
          ]).map((el: any) => {
            // Only use selector, ignore attribute parameter
            if (typeof el === 'string') return { selector: el };
            return { selector: el.selector };
          })
        };
        break;
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid type. Supported: screenshot, pdf, content, scrape' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }

    console.log(`Making Browserless API request to ${endpoint} for URL: ${url}`);

    const response = await fetch(`${endpoint}?token=${browserlessApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Browserless API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Browserless API request failed', 
          status: response.status,
          details: errorText
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    
    if (type === 'scrape') {
      const data = await response.json();
      return new Response(
        JSON.stringify(data),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else if (type === 'content') {
      const html = await response.text();
      return new Response(html, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
      });
    } else {
      // For screenshot and PDF, return the binary data
      const data = await response.arrayBuffer();
      return new Response(data, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': contentType,
          'Content-Length': data.byteLength.toString()
        },
      });
    }
    } catch (err: any) {
      console.error('Error in browserless-render function:', err);
      return new Response(
        JSON.stringify({ error: err.message || 'Unknown error occurred' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
});