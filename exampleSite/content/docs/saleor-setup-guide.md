+++
title = "Saleor Integration Guide"
date = 2023-08-22T16:00:00-07:00
draft = false
tags = ["ecommerce", "saleor", "headless commerce", "graphql", "tutorial", "integration"]
categories = ["guides", "ecommerce"]
toc = true
description = "Developer-focused guide for implementing and integrating Saleor headless commerce platform with your PKB-theme project"
+++

# Setting Up Saleor with PKB-theme

This guide provides detailed instructions for developers to install, configure, and integrate Saleor - a modern, GraphQL-first headless commerce platform - with your PKB-theme knowledge base or blog.

## Introduction to Saleor

Saleor is a headless e-commerce platform built with Python, Django, and GraphQL. Unlike traditional e-commerce systems, Saleor separates the backend (data and business logic) from the frontend (user interface), allowing for more flexible and customizable implementations.

**Key advantages:**
- API-first architecture with GraphQL
- Flexible data model
- Customizable without core modifications
- Built with modern technologies
- Performance-focused design

## Prerequisites

This guide assumes you have:

- Intermediate to advanced development experience
- Familiarity with Docker and containerization
- Basic understanding of GraphQL
- Command line interface experience
- Python 3.8+ installed
- Docker and Docker Compose installed
- Node.js 16+ and npm/yarn installed
- Git version control

## Installation Options

### Option 1: Docker Installation (Recommended)

1. Clone the Saleor repository:
   ```bash
   git clone https://github.com/saleor/saleor.git
   cd saleor
   ```

2. Build and start the Docker containers:
   ```bash
   docker-compose up -d
   ```

3. Populate the database with example data:
   ```bash
   docker-compose exec api python manage.py populatedb
   ```

4. Access the Dashboard at `http://localhost:9000` and the GraphQL API playground at `http://localhost:8000/graphql/`

### Option 2: Manual Installation

1. Clone the Saleor repository:
   ```bash
   git clone https://github.com/saleor/saleor.git
   cd saleor
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

5. Edit the `.env` file with your database configuration

6. Create the database and run migrations:
   ```bash
   python manage.py migrate
   ```

7. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

8. Load example data (optional):
   ```bash
   python manage.py populatedb
   ```

9. Start the development server:
   ```bash
   python manage.py runserver
   ```

10. Install and run the dashboard:
    ```bash
    # In a separate terminal:
    git clone https://github.com/saleor/saleor-dashboard.git
    cd saleor-dashboard
    npm install
    npm start
    ```

## Configuration and Core Setup

### Step 1: Initial Configuration

1. Access the Saleor Dashboard (default: `http://localhost:9000`)
2. Log in with your admin credentials
3. Navigate to Configuration → Site Settings
4. Configure:
   - Company information
   - Default currency and country
   - Units of weight and measurement
   - Default payment and shipping methods

### Step 2: Product Catalog Setup

1. Create product categories (Products → Categories)
2. Create product types with appropriate attributes (Products → Product Types)
3. Add products (Products → Products)
   - Include descriptions, images, pricing
   - Configure variants if applicable
   - Set metadata for SEO

### Step 3: API Configuration and Access

1. Create an App token for API access:
   - Go to Apps → Create App
   - Name your app (e.g., "PKB Integration")
   - Select permissions (at minimum: products read)
   - Save the generated token

2. Test your API with a GraphQL query:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        -H "Content-Type: application/json" \
        -X POST \
        -d '{"query": "query { products(first: 5) { edges { node { name } } } }"}' \
        http://localhost:8000/graphql/
   ```

## Integrating with PKB-theme

Saleor's headless architecture allows for several integration approaches with your PKB-theme website.

### Method 1: JAMstack Integration

This approach uses JavaScript to fetch and display products from Saleor within your Hugo-based PKB-theme:

1. Create a JavaScript module to interact with Saleor's GraphQL API:
   ```javascript
   // static/js/saleor-client.js
   class SaleorClient {
     constructor(apiUrl, token) {
       this.apiUrl = apiUrl;
       this.token = token;
     }
     
     async query(graphqlQuery, variables = {}) {
       const response = await fetch(this.apiUrl, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': this.token ? `Bearer ${this.token}` : '',
         },
         body: JSON.stringify({
           query: graphqlQuery,
           variables
         }),
       });
       
       if (!response.ok) {
         throw new Error('Network response was not ok');
       }
       
       return await response.json();
     }
     
     async getFeaturedProducts(limit = 3) {
       const query = `
         query FeaturedProducts($limit: Int!) {
           products(first: $limit, channel: "default-channel") {
             edges {
               node {
                 id
                 name
                 description
                 thumbnail {
                   url
                 }
                 pricing {
                   priceRange {
                     start {
                       gross {
                         amount
                         currency
                       }
                     }
                   }
                 }
                 slug
               }
             }
           }
         }
       `;
       
       const result = await this.query(query, { limit });
       return result.data.products.edges.map(edge => edge.node);
     }
   }
   
   window.SaleorClient = SaleorClient;
   ```

2. Create a Hugo shortcode to display products:
   ```html
   <!-- layouts/shortcodes/saleor-products.html -->
   <div class="saleor-products">
     <div id="products-container" class="products-grid">
       <p>Loading products...</p>
     </div>
   </div>
   
   <script>
     document.addEventListener('DOMContentLoaded', async function() {
       try {
         const client = new SaleorClient(
           '{{ .Site.Params.saleor.apiUrl | default "http://localhost:8000/graphql/" }}',
           '{{ .Site.Params.saleor.apiToken | default "" }}'
         );
         
         const products = await client.getFeaturedProducts({{ .Get "limit" | default 3 }});
         const container = document.getElementById('products-container');
         
         if (products.length === 0) {
           container.innerHTML = '<p>No products found</p>';
           return;
         }
         
         container.innerHTML = products.map(product => `
           <div class="product-card">
             <div class="product-image">
               <img src="${product.thumbnail?.url || '/images/placeholder.jpg'}" alt="${product.name}">
             </div>
             <div class="product-info">
               <h3>${product.name}</h3>
               <p class="product-price">${product.pricing.priceRange.start.gross.amount} ${product.pricing.priceRange.start.gross.currency}</p>
               <a href="/product/${product.slug}" class="product-link">View Details</a>
             </div>
           </div>
         `).join('');
       } catch (error) {
         console.error('Failed to load products:', error);
         document.getElementById('products-container').innerHTML = 
           '<p>Failed to load products. Please try again later.</p>';
       }
     });
   </script>
   ```

3. Add configuration to your `config.toml`:
   ```toml
   [params.saleor]
     apiUrl = "https://your-saleor-instance.com/graphql/"
     apiToken = "your-api-token"
     storeUrl = "https://your-storefront.com"
   ```

4. Add CSS for the product displays:
   ```css
   /* assets/css/saleor-integration.css */
   .saleor-products {
     margin: 2rem 0;
   }
   
   .products-grid {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
     gap: 2rem;
   }
   
   .product-card {
     border: 1px solid var(--color-border);
     border-radius: var(--border-radius);
     overflow: hidden;
     transition: transform 0.3s ease, box-shadow 0.3s ease;
   }
   
   .product-card:hover {
     transform: translateY(-5px);
     box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
   }
   
   .product-image img {
     width: 100%;
     height: 200px;
     object-fit: cover;
   }
   
   .product-info {
     padding: 1rem;
   }
   
   .product-price {
     font-weight: bold;
     color: var(--color-primary);
   }
   
   .product-link {
     display: inline-block;
     padding: 0.5rem 1rem;
     background-color: var(--color-primary);
     color: white;
     text-decoration: none;
     border-radius: var(--border-radius);
     margin-top: 1rem;
     transition: background-color 0.2s ease;
   }
   
   .product-link:hover {
     background-color: var(--color-primary-variant);
   }
   ```

5. Use the shortcode in your markdown content:
   ```markdown
   ## Shop Our Products
   
   Here are some featured items from our store:
   
   {{</* saleor-products limit="4" */>}}
   ```

### Method 2: Full Product Pages with Hugo

For a deeper integration with product detail pages:

1. Create a data fetching script to run during Hugo build:
   ```python
   # scripts/fetch-saleor-products.py
   import json
   import os
   import requests
   
   SALEOR_API_URL = os.getenv('SALEOR_API_URL', 'http://localhost:8000/graphql/')
   SALEOR_API_TOKEN = os.getenv('SALEOR_API_TOKEN')
   
   def fetch_all_products():
       headers = {
           'Content-Type': 'application/json',
       }
       
       if SALEOR_API_TOKEN:
           headers['Authorization'] = f'Bearer {SALEOR_API_TOKEN}'
       
       query = """
       query {
         products(first: 100, channel: "default-channel") {
           edges {
             node {
               id
               name
               description
               slug
               thumbnail {
                 url
               }
               images {
                 url
                 alt
               }
               pricing {
                 priceRange {
                   start {
                     gross {
                       amount
                       currency
                     }
                   }
                 }
               }
               category {
                 name
                 slug
               }
             }
           }
         }
       }
       """
       
       response = requests.post(
           SALEOR_API_URL,
           headers=headers,
           json={'query': query}
       )
       
       if response.status_code != 200:
           print(f"Query failed with status code {response.status_code}")
           print(response.text)
           return []
       
       data = response.json()
       return [edge['node'] for edge in data['data']['products']['edges']]
   
   def generate_product_files(products):
       for product in products:
           content = f"""---
   title: "{product['name']}"
   date: {os.environ.get('HUGO_DATE', '2023-01-01T00:00:00Z')}
   draft: false
   product_id: "{product['id']}"
   price: "{product['pricing']['priceRange']['start']['gross']['amount']}"
   currency: "{product['pricing']['priceRange']['start']['gross']['currency']}"
   image: "{product['thumbnail']['url'] if product['thumbnail'] else ''}"
   category: "{product['category']['name'] if product['category'] else 'Uncategorized'}"
   layout: product
   ---
   
   {product['description']}
   """
           
           slug = product['slug']
           os.makedirs('content/products', exist_ok=True)
           
           with open(f'content/products/{slug}.md', 'w', encoding='utf-8') as f:
               f.write(content)
       
       # Also save the full data for reference
       with open('data/saleor_products.json', 'w', encoding='utf-8') as f:
           json.dump(products, f, indent=2)
   
   if __name__ == '__main__':
       products = fetch_all_products()
       generate_product_files(products)
       print(f"Generated {len(products)} product files")
   ```

2. Create a product layout template:
   ```html
   <!-- layouts/_default/product.html -->
   {{ define "main" }}
   <article class="product-page">
     <div class="product-container">
       <div class="product-image">
         <img src="{{ .Params.image }}" alt="{{ .Title }}">
       </div>
       
       <div class="product-details">
         <h1>{{ .Title }}</h1>
         
         <div class="product-meta">
           <div class="product-price">{{ .Params.price }} {{ .Params.currency }}</div>
           <div class="product-category">{{ .Params.category }}</div>
         </div>
         
         <div class="product-description">
           {{ .Content }}
         </div>
         
         <div class="product-actions">
           <button class="add-to-cart" 
                   data-product-id="{{ .Params.product_id }}"
                   onclick="addToCart('{{ .Params.product_id }}')">
             Add to Cart
           </button>
         </div>
       </div>
     </div>
   </article>
   
   <script>
   function addToCart(productId) {
     const saleorUrl = '{{ .Site.Params.saleor.storeUrl }}';
     // In a real implementation, you'd either:
     // 1. Use Saleor's checkout API directly
     // 2. Redirect to your Storefront with this product in the cart
     // For simplicity, we'll redirect to the product page:
     window.location.href = `${saleorUrl}/products/${productId}`;
   }
   </script>
   {{ end }}
   ```

3. Add a build script to your package.json:
   ```json
   {
     "scripts": {
       "fetch-products": "python scripts/fetch-saleor-products.py",
       "build": "npm run fetch-products && hugo"
     }
   }
   ```

### Method 3: Full Storefront Integration

For a complete storefront solution:

1. Set up Saleor's Storefront API and React Storefront
2. Create custom React components for product listings and details
3. Use server-side rendering (SSR) or static site generation (SSG) to build product pages
4. Integrate authentication between your PKB-theme and the storefront
5. Style the storefront to match your PKB-theme's design language

## Advanced Integration: Checkout Process

To create a complete shopping experience:

1. Integrate with Saleor's Checkout API:
   ```javascript
   // static/js/saleor-checkout.js
   class SaleorCheckout {
     constructor(apiUrl, token) {
       this.client = new SaleorClient(apiUrl, token);
     }
     
     async createCheckout(variantId, quantity) {
       const query = `
         mutation {
           checkoutCreate(
             input: {
               lines: [{ quantity: ${quantity}, variantId: "${variantId}" }],
               channel: "default-channel"
             }
           ) {
             checkout {
               id
               token
               totalPrice {
                 gross {
                   amount
                   currency
                 }
               }
               checkoutUrl
             }
             errors {
               field
               message
             }
           }
         }
       `;
       
       const result = await this.client.query(query);
       return result.data.checkoutCreate;
     }
   }
   
   window.SaleorCheckout = SaleorCheckout;
   ```

2. Use the Checkout API in your product pages:
   ```html
   <script>
   async function addToCart(variantId) {
     try {
       const checkout = new SaleorCheckout(
         '{{ .Site.Params.saleor.apiUrl }}',
         '{{ .Site.Params.saleor.apiToken }}'
       );
       
       const quantity = parseInt(document.getElementById('quantity').value);
       const result = await checkout.createCheckout(variantId, quantity);
       
       if (result.errors && result.errors.length > 0) {
         alert(`Error: ${result.errors[0].message}`);
         return;
       }
       
       // Redirect to Saleor's checkout page
       window.location.href = result.checkout.checkoutUrl;
     } catch (error) {
       console.error('Checkout error:', error);
       alert('There was an error adding this item to your cart.');
     }
   }
   </script>
   ```

## Security Considerations

1. **API Security**:
   - Store API tokens securely
   - Use environment variables for sensitive credentials
   - Implement proper CORS settings in Saleor
   - Consider using a proxy for client-side API calls

2. **User Data Protection**:
   - Ensure GDPR compliance
   - Implement proper SSL/TLS encryption
   - Use HTTPS for all communications
   - Follow PCI DSS guidelines for payment data

3. **Maintaining Updates**:
   - Keep Saleor updated to the latest version
   - Monitor for security advisories
   - Use dependency scanning tools

## Performance Optimization

1. **API Optimization**:
   - Request only needed fields in GraphQL queries
   - Implement pagination for large datasets
   - Use query batching where appropriate
   - Cache API responses where possible

2. **Image Optimization**:
   - Use Saleor's thumbnail feature
   - Implement responsive images
   - Consider a CDN for media assets

3. **Frontend Performance**:
   - Minimize JavaScript payload
   - Use lazy loading for images and components
   - Implement code splitting
   - Consider pre-rendering product pages

## Conclusion

Integrating Saleor with your PKB-theme offers a powerful combination of content and commerce. The API-first architecture allows for flexible implementations, whether you want a simple product showcase or a complete shopping experience.

Remember that Saleor is a developer-focused platform. While the integration requires more technical knowledge than traditional e-commerce systems, it provides greater flexibility and customization potential. For complex implementations, consider working with a developer experienced in both Saleor and web development.

For further assistance, refer to the [Saleor documentation](https://docs.saleor.io/) or join the [Saleor community](https://github.com/saleor/saleor/discussions).
