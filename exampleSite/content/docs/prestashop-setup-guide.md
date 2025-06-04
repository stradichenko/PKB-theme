+++
title = "PrestaShop Integration Guide"
date = 2023-08-21T15:00:00-07:00
draft = false
tags = ["ecommerce", "prestashop", "self-hosted", "tutorial", "integration"]
categories = ["guides", "ecommerce"]
toc = true
description = "Comprehensive guide for installing and integrating PrestaShop with your PKB-theme project"
+++

# Setting Up PrestaShop with PKB-theme

This guide walks you through the process of installing, configuring, and integrating PrestaShop with your PKB-theme knowledge base or blog site.

## Prerequisites

Before beginning the installation, ensure your environment meets these requirements:

- Web server (Apache, Nginx) with PHP 7.4+ (PHP 8.0+ recommended)
- MySQL 5.6+ or MariaDB 10.0+
- PHP extensions: GD, cURL, SimpleXML, DOM, Zip, PDO, and Mcrypt
- At least 250MB of disk space
- Server memory limit of at least 256MB
- FTP or SSH access to your server
- Database credentials

## Installation Process

### Step 1: Server Preparation

1. Create a dedicated subdomain (recommended) or subdirectory for your store:
   ```
   shop.yourdomain.com
   ```
   or
   ```
   yourdomain.com/shop
   ```

2. Create a MySQL database and user:
   ```sql
   CREATE DATABASE prestashop;
   CREATE USER 'prestashop_user'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON prestashop.* TO 'prestashop_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. Configure PHP settings (preferably in php.ini):
   ```ini
   memory_limit = 256M
   upload_max_filesize = 16M
   post_max_size = 16M
   max_execution_time = 300
   max_input_time = 300
   ```

### Step 2: Download and Extract PrestaShop

1. Download the latest version from [PrestaShop's website](https://www.prestashop.com/en/download)

2. Extract the package:
   ```bash
   unzip prestashop_*.zip
   ```

3. Upload the extracted files to your server:
   ```bash
   # Using FTP client or, if using SSH:
   scp -r prestashop/* user@server:/path/to/shop/
   ```

### Step 3: Set Up File Permissions

For Linux/Unix servers:
```bash
# Find & set proper permissions
find /path/to/shop/ -type d -exec chmod 755 {} \;
find /path/to/shop/ -type f -exec chmod 644 {} \;

# Ensure specific directories are writable
chmod -R 777 /path/to/shop/img/
chmod -R 777 /path/to/shop/cache/
chmod -R 777 /path/to/shop/log/
chmod -R 777 /path/to/shop/download/
chmod -R 777 /path/to/shop/upload/
chmod -R 777 /path/to/shop/config/
chmod -R 777 /path/to/shop/app/config/
chmod -R 777 /path/to/shop/themes/
chmod -R 777 /path/to/shop/translations/
chmod -R 777 /path/to/shop/modules/
chmod -R 777 /path/to/shop/var/
```

### Step 4: Run Web Installer

1. Navigate to your store URL (e.g., `shop.yourdomain.com`) to launch the installer
2. Follow the installation wizard:
   - Select your language
   - Accept the license agreement
   - Run compatibility check and resolve any issues
   - Enter your store information (name, activity, country, etc.)
   - Enter your database details
   - Configure your admin account
   - Complete the installation

3. Delete the installation directory after completion:
   ```bash
   rm -rf /path/to/shop/install/
   ```

4. Rename the admin directory for security (follow the suggestion from the installer):
   ```bash
   # Example:
   mv /path/to/shop/admin /path/to/shop/admin123xyz
   ```

## Post-Installation Configuration

### Step 1: Store Setup

1. Log in to your admin panel at the renamed admin directory
2. Navigate to Shop Parameters → General
3. Configure basic settings:
   - Store name
   - Store contact details
   - Enable/disable features
   - Set default store options

### Step 2: Configure Localization

1. Go to International → Localization
   - Set default language
   - Configure your local currency
   - Set up tax rules for your region
   - Configure units of measure

2. Set up shipping zones (International → Locations)
   - Create zones for shipping rules
   - Define countries where you ship

### Step 3: Payment Configuration

1. Navigate to Payment → Payment Methods
   - Enable and configure payment modules
   - Common options: PayPal, Stripe, bank transfer
   - Configure restrictions if needed

2. Set up tax rules (International → Taxes)
   - Create tax rules appropriate for your country and products

## Integrating with PKB-theme

### Method 1: Header/Footer Links

1. Create mutual navigation elements between your blog and store:

   In your PKB-theme header (`layouts/partials/header.html`), add a link to your shop:
   ```html
   <nav>
     <ul>
       <!-- Existing navigation items -->
       <li><a href="https://shop.yourdomain.com" class="shop-link">Shop</a></li>
     </ul>
   </nav>
   ```

2. Add a link to your blog in PrestaShop:
   - Access PrestaShop admin → Design → Theme Customization → "Header" tab
   - Add a custom link to your blog
   - Or edit the theme directly: `/themes/your_theme/templates/header.tpl`

### Method 2: Product Showcase on Blog

1. Create a PrestaShop webservice API key:
   - Go to Advanced Parameters → Webservice
   - Enable the webservice
   - Add a new API key with "GET" permissions for products
   - Note your API key

2. Create a PHP script to fetch products in your PKB-theme project:
   ```php
   <?php
   // Save as static/api/prestashop-products.php
   
   // Configuration
   $webservice_url = 'https://shop.yourdomain.com/api';
   $api_key = 'YOUR_API_KEY';
   
   // Get featured products
   function getFeaturedProducts($limit = 3) {
       global $webservice_url, $api_key;
       
       $ch = curl_init();
       curl_setopt($ch, CURLOPT_URL, $webservice_url . '/products?display=[id,name,price,description_short,link_rewrite,id_default_image]&filter[active]=[1]&limit=' . $limit);
       curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
       curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Basic ' . base64_encode($api_key . ':')));
       
       $response = curl_exec($ch);
       curl_close($ch);
       
       return simplexml_load_string($response);
   }
   
   // Process request
   header('Content-Type: application/json');
   $products = getFeaturedProducts();
   $result = array();
   
   foreach ($products->products->product as $product) {
       $id = (int)$product->id;
       $result[] = array(
           'id' => $id,
           'name' => (string)$product->name->language,
           'description' => (string)$product->description_short->language,
           'price' => (string)$product->price,
           'image' => 'https://shop.yourdomain.com/' . $id . '-large_default/' . (string)$product->link_rewrite->language . '.jpg',
           'url' => 'https://shop.yourdomain.com/' . (string)$product->link_rewrite->language . '.html'
       );
   }
   
   echo json_encode($result);
   ?>
   ```

3. Create a Hugo shortcode to display products:
   ```html
   <!-- layouts/shortcodes/prestashop-products.html -->
   <div class="product-showcase">
     <div class="products-container" id="prestashop-products">
       <p>Loading products...</p>
     </div>
   </div>
   
   <script>
   document.addEventListener('DOMContentLoaded', function() {
     fetch('/api/prestashop-products.php')
       .then(response => response.json())
       .then(products => {
         const container = document.getElementById('prestashop-products');
         container.innerHTML = '';
         
         products.forEach(product => {
           container.innerHTML += `
             <div class="product-card">
               <img src="${product.image}" alt="${product.name}">
               <h3>${product.name}</h3>
               <p>${product.description}</p>
               <p class="price">${product.price}</p>
               <a href="${product.url}" class="button">View Product</a>
             </div>
           `;
         });
       })
       .catch(error => {
         document.getElementById('prestashop-products').innerHTML = 
           '<p>Unable to load products. Please visit our shop directly.</p>';
         console.error('Error fetching products:', error);
       });
   });
   </script>
   ```

4. Use the shortcode in your content:
   ```markdown
   ## Featured Products
   
   Check out these products from our store:
   
   {{</* prestashop-products */>}}
   ```

5. Add appropriate CSS in your theme:
   ```css
   /* assets/css/prestashop-integration.css */
   .product-showcase {
     margin: 2rem 0;
   }
   
   .products-container {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
     gap: 2rem;
   }
   
   .product-card {
     border: 1px solid #eaeaea;
     border-radius: 8px;
     padding: 1rem;
     transition: transform 0.3s ease, box-shadow 0.3s ease;
   }
   
   .product-card:hover {
     transform: translateY(-5px);
     box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
   }
   
   .product-card img {
     width: 100%;
     height: auto;
     border-radius: 4px;
   }
   
   .product-card .price {
     font-weight: bold;
     color: #e44d26;
   }
   
   .product-card .button {
     display: inline-block;
     background-color: #4a90e2;
     color: white;
     padding: 0.5rem 1rem;
     border-radius: 4px;
     text-decoration: none;
     text-align: center;
     transition: background-color 0.3s ease;
   }
   
   .product-card .button:hover {
     background-color: #3a7bc8;
   }
   ```

### Method 3: Single Sign-On (Advanced)

For a seamless user experience between your blog and shop:

1. Create a shared authentication system using OAuth or custom tokens
2. Develop middleware to handle authentication between systems
3. Store user sessions in a shared database or Redis cache
4. Implement cross-domain cookies (where supported by browsers)

## Theme Integration

For visual consistency between your blog and shop:

1. Extract color schemes and typography from your PKB-theme
2. Create a custom PrestaShop theme or modify an existing one:
   - Access theme files at `/themes/your_theme/`
   - Update CSS variables to match your blog
   - Use similar fonts, button styles, and color scheme

3. Export logos and other brand assets to both platforms

## Security Best Practices

1. Always use HTTPS for both your blog and store
2. Keep PrestaShop updated to the latest version
3. Install a security module like "1-Click Upgrade" for easy updates
4. Use strong, unique passwords for admin accounts
5. Enable two-factor authentication if available
6. Configure your .htaccess file to protect sensitive directories
7. Set up regular database and file backups
8. Monitor your store logs for suspicious activity
9. Use a Web Application Firewall (WAF)

## Performance Optimization

1. Enable PrestaShop's built-in caching (Advanced Parameters → Performance)
2. Configure browser caching in your server configuration
3. Use a CDN for static assets
4. Optimize and compress images
5. Consider using a page caching module
6. Enable compilation of Smarty templates
7. Use a PHP optimizer (OPcache)
8. Consider a Redis or Memcached implementation for session storage

## Conclusion

You now have a functional PrestaShop store integrated with your PKB-theme website. This integration allows your readers to seamlessly transition from consuming your content to shopping in your store.

For advanced customization and integration needs, consider consulting with a developer who specializes in both PrestaShop and web development. For assistance and troubleshooting, visit the [PrestaShop Forum](https://www.prestashop.com/forums/) or the [official documentation](https://devdocs.prestashop.com/).
