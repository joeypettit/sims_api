# Sims App User Guide

Welcome to the Sims App user guide. This guide is designed for sales associates, designers, and administrators who use the application to manage projects and create proposals for clients.

## Table of Contents

- [Getting Started](#getting-started)
- [Projects](#projects)
- [Clients](#clients)
- [Creating Proposals](#creating-proposals)
- [Templates](#templates)
- [User Management](#user-management)
- [Settings](#settings)

## Getting Started

### Logging In

1. Navigate to the application URL
2. Enter your email address and password
3. Click "Sign In"

**First Time Login:**
If you received a temporary password from an admin, you'll be prompted to create a new password after your first login.

### Navigation

The main navigation bar is located on the left side of the screen. Key sections include:

- **My Projects** - View projects you've starred or are assigned to
- **Projects** - View all projects (if you have access)
- **Clients** - Manage client information
- **Profile** - View and update your profile information
- **Users** (Admin only) - Manage user accounts
- **Settings** (Admin only) - Configure templates, line items, and system settings

## Projects

### Creating a New Project

1. Navigate to **Projects** from the main menu
2. Click the **"Add Project"** button
3. Fill in the project details:
   - **Name**: Project name (e.g., "Smith Kitchen Renovation")
   - **Description**: Brief description of the project
   - **Start Date** (optional): Project start date
   - **End Date** (optional): Project completion date
4. Add **Clients** by selecting from existing clients or creating new ones
5. Add **Project Managers** (users assigned to the project)
6. Click **"Create Project"**

### Viewing Projects

- Click on any project from the projects list to view details
- Use the search bar to filter projects by name
- Star projects to add them to your "My Projects" view

### Project Areas

Each project can contain multiple areas (e.g., "Kitchen", "Bathroom", "Master Bathroom").

**Adding an Area:**
1. Open a project
2. Click **"Add Area"**
3. Enter the area name
4. Optionally select a template to pre-populate the area with line items
5. Click **"Create Area"**

**Editing an Area:**
1. Click on an area name to open the area proposal view
2. This is where you'll build the detailed budget with line items

## Clients

### Creating a Client

1. Navigate to **Clients** from the main menu
2. Click **"Add Client"**
3. Fill in client information:
   - **First Name**
   - **Last Name**
   - **Email** (optional)
   - **Phone** (optional)
4. Click **"Create Client"**

### Managing Clients

- Click on a client name to view their details
- View all projects associated with a client
- Edit client information by clicking the edit icon
- Delete clients (if no projects are associated)

## Creating Proposals

The proposal view is where you build detailed budgets for project areas. Each proposal displays line items in a three-column format representing three pricing tiers.

### Understanding the Three-Tier System

Each line item can have up to three options, representing different quality/price levels:

- **Premier** (Column 1) - Entry-level, budget-friendly options
- **Designer** (Column 2) - Mid-range, balanced options
- **Luxury** (Column 3) - Premium, high-end options

### Line Items

**What are Line Items?**
Line items are the individual products or services in your proposal (e.g., "Cabinets", "Countertops", "Flooring").

**Adding Line Items:**
Line items are typically added through templates. To manually add or edit line items, you'll need Admin access to the Settings page.

**Line Item Details:**
- **Name**: Product or service name
- **Quantity**: Amount needed (e.g., 25.5 square feet)
- **Unit**: Unit of measurement (e.g., sq ft, each, linear ft)
- **Margin**: Profit margin percentage (used for price calculations)

### Options

Each line item can have multiple options (one per tier). Options include:

- **Description**: What the option includes
- **Cost**: Cost per unit (can be a range: low-high, or exact)
- **Price Adjustment**: Multiplier for adjusting the base price
- **Tier**: Which pricing tier this option belongs to (Premier, Designer, or Luxury)

**Selecting Options:**
- Click on an option to select it for that tier
- Selected options are highlighted
- Only one option per tier can be selected per line item

### Reordering Line Items

- Click and drag the drag handle (⋮⋮) on the left side of a line item
- Drop it in the desired position
- The order is automatically saved

### Viewing Totals

At the top of the proposal view, you'll see a sticky toolbar showing:

- **Tier Totals**: Total cost for each tier (Premier, Designer, Luxury)
- **Estimated Total**: The estimated cost range based on selected options

These totals update automatically as you select different options.

## Templates

Templates allow you to quickly create project areas with pre-configured line items and options.

### Using Templates

When creating a new project area:
1. Click **"Add Area"**
2. Enter the area name
3. Select a template from the dropdown
4. Click **"Create Area"**

The new area will be populated with all line items, groups, and options from the template.

### Creating Templates (Admin Only)

1. Navigate to **Settings** → **Templates**
2. Click **"Add Template"**
3. Enter template name
4. Add line item groups and line items
5. Configure options for each line item
6. Save the template

Templates can be duplicated and modified to create variations.

## User Management (Admin Only)

### Creating Users

1. Navigate to **Users** from the main menu
2. Click **"Add User"**
3. Fill in user information:
   - **First Name**
   - **Last Name**
   - **Email** (must be unique)
   - **Password** (temporary password)
   - **Role**: USER or ADMIN
4. Click **"Create User"**

**Note:** Only Super Admins can create Admin users.

### Managing Users

- Click on a user to view their details
- **Edit**: Update user information and role
- **Block/Unblock**: Prevent or allow user access
- **Reset Password**: Generate a new temporary password
- **Delete**: Remove a user account (cannot delete Super Admins)

### User Roles

- **USER**: Can create and manage their own projects
- **ADMIN**: Can manage users and access settings
- **SUPER_ADMIN**: Full system access (cannot be modified or deleted)

## Settings (Admin Only)

The Settings page allows administrators to configure:

### Templates
- Create, edit, and delete area templates
- Duplicate existing templates

### Line Items
- Create and edit line items
- Set default quantities, units, and margins
- Configure options for each line item

### Units
- Manage units of measurement (sq ft, linear ft, each, etc.)

## Tips and Best Practices

### Working with Clients

1. **Create clients first** before creating projects
2. **Associate multiple clients** with a project if needed (e.g., husband and wife)
3. **Use descriptive project names** that include the client's name

### Building Proposals

1. **Start with a template** to save time
2. **Adjust quantities** based on actual measurements
3. **Select appropriate options** for each tier based on client needs
4. **Use the tier totals** to help clients understand budget differences
5. **Reorder line items** to group related items together

### Managing Projects

1. **Star important projects** to quickly access them from "My Projects"
2. **Add project managers** to collaborate with team members
3. **Use clear area names** (e.g., "Kitchen", "Master Bath", "Guest Bath")

## Troubleshooting

### Can't see certain features?
- Check your user role. Some features are only available to Admins or Super Admins.

### Can't edit a line item?
- Line items must be edited from the Settings page (Admin access required).

### Totals not updating?
- Make sure you've selected an option for each line item in the tier you're viewing.

### Need help?
- Contact your system administrator or IT support.

---

**For technical documentation and developer information, see [README.md](README.md)**

