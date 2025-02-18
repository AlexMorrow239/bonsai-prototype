export const mockChatData = [
  {
    // Basic chat info
    chatInfo: {
      chat_id: 1,
      project_id: 101,
      title: "Website Redesign Discussion",
    },

    // Project context
    projectContext: {
      project_id: 101,
      name: "Company Website Redesign",
      description: "Redesigning the company website with modern UI/UX",
    },

    // Chat messages
    messages: [
      {
        message_id: 1,
        content:
          "I need help planning the architecture for our new website redesign project.",
        created_at: "2024-03-15T09:00:00Z",
        is_ai_response: false,
      },
      {
        message_id: 2,
        content:
          "I'll help you plan the website architecture. What are the main features you want to include in the redesign?",
        created_at: "2024-03-15T09:01:00Z",
        is_ai_response: true,
      },
      {
        message_id: 3,
        content:
          "We need a modern homepage, product catalog, blog section, and contact form. The current website is outdated and difficult to navigate.",
        created_at: "2024-03-15T09:02:00Z",
        is_ai_response: false,
      },
      {
        message_id: 4,
        content:
          "Based on your requirements, here's a suggested architecture:\n\n1. Homepage\n- Hero section with main value proposition\n- Featured products carousel\n- Quick navigation cards\n\n2. Product Catalog\n- Grid layout with filters\n- Search functionality\n- Product detail pages\n\n3. Blog Section\n- Article listing page\n- Category filtering\n- Search integration\n\n4. Contact Form\n- Form validation\n- Google Maps integration\n- Contact information\n\nWould you like me to elaborate on any of these sections?",
        created_at: "2024-03-15T09:03:00Z",
        is_ai_response: true,
      },
      {
        message_id: 5,
        content:
          "This looks good! Can you provide more details about the homepage layout?",
        created_at: "2024-03-15T09:04:00Z",
        is_ai_response: false,
      },
      {
        message_id: 6,
        content:
          "Here's a detailed breakdown of the homepage layout:\n\n1. Hero Section\n- Full-width banner with compelling headline\n- Call-to-action button\n- Background image or video\n\n2. Features Section\n- 3-4 key features with icons\n- Brief descriptions\n- Visual hierarchy\n\n3. Product Showcase\n- Featured products slider\n- Product cards with images\n- Quick view functionality\n\n4. Social Proof\n- Customer testimonials\n- Trust badges\n- Client logos\n\n5. Footer\n- Navigation links\n- Social media icons\n- Newsletter signup\n\nWould you like me to create a basic wireframe for this layout?",
        created_at: "2024-03-15T09:05:00Z",
        is_ai_response: true,
      },
    ],
  },
  {
    // Chat 2: Frontend Component Architecture
    chatInfo: {
      chat_id: 2,
      project_id: 101,
      title: "Frontend Component Architecture",
    },
    projectContext: {
      project_id: 101,
      name: "Company Website Redesign",
      description: "Redesigning the company website with modern UI/UX",
    },
    messages: [
      {
        message_id: 1,
        content:
          "Let's discuss the component architecture for our product catalog section.",
        created_at: "2024-03-15T14:00:00Z",
        is_ai_response: false,
      },
      {
        message_id: 2,
        content:
          "I'll help you design a scalable component structure. What are the main features needed in the product catalog?",
        created_at: "2024-03-15T14:05:00Z",
        is_ai_response: true,
      },
      {
        message_id: 3,
        content:
          "We need filtering, sorting, product cards, and a quick view modal.",
        created_at: "2024-03-15T14:15:00Z",
        is_ai_response: false,
      },
      {
        message_id: 4,
        content:
          "Here's a proposed component hierarchy:\n\n1. ProductCatalog (Parent)\n- FilterPanel\n  - FilterGroup\n  - FilterItem\n- SortDropdown\n- ProductGrid\n  - ProductCard\n    - QuickViewButton\n    - ProductImage\n    - ProductInfo\n- QuickViewModal\n  - ProductGallery\n  - ProductDetails\n\nWould you like me to explain the responsibilities of each component?",
        created_at: "2024-03-15T14:20:00Z",
        is_ai_response: true,
      },
      {
        message_id: 5,
        content:
          "Yes, please break down the component structure for the product catalog.",
        created_at: "2024-03-15T14:30:00Z",
        is_ai_response: false,
      },
    ],
  },
  {
    // Chat 3: API Integration Planning
    chatInfo: {
      chat_id: 3,
      project_id: 102,
      title: "API Integration Planning",
    },
    projectContext: {
      project_id: 102,
      name: "Customer Portal",
      description: "Building a new customer portal for account management",
    },
    messages: [
      {
        message_id: 1,
        content:
          "We need to plan the API integration for user authentication. What's the best approach?",
        created_at: "2024-03-14T16:30:00Z",
        is_ai_response: false,
      },
      {
        message_id: 2,
        content:
          "For user authentication, I recommend implementing JWT (JSON Web Tokens). Would you like me to outline the authentication flow?",
        created_at: "2024-03-14T16:35:00Z",
        is_ai_response: true,
      },
      {
        message_id: 3,
        content: "Yes, please explain the JWT authentication flow.",
        created_at: "2024-03-14T16:40:00Z",
        is_ai_response: false,
      },
      {
        message_id: 4,
        content:
          "Here's the proposed authentication flow using JWT tokens:\n\n1. Login Flow\n- User submits credentials\n- Server validates credentials\n- Server generates JWT token\n- Client stores token\n\n2. Request Flow\n- Client includes token in Authorization header\n- Server validates token\n- Server processes request\n\n3. Token Refresh\n- Implement refresh token rotation\n- Auto-refresh near expiration\n\nWould you like me to provide code examples for any of these steps?",
        created_at: "2024-03-14T16:45:00Z",
        is_ai_response: true,
      },
    ],
  },
  {
    // Chat 4: Initial Project Setup
    chatInfo: {
      chat_id: 4,
      project_id: 101,
      title: "Initial Project Setup",
    },
    projectContext: {
      project_id: 101,
      name: "Company Website Redesign",
      description: "Redesigning the company website with modern UI/UX",
    },
    messages: [
      {
        message_id: 1,
        content:
          "Can you help me set up the initial development environment for our project?",
        created_at: "2024-03-10T11:00:00Z",
        is_ai_response: false,
      },
      {
        message_id: 2,
        content:
          "I'll help you set up the development environment. Let's start with the basic configuration. What framework are you planning to use?",
        created_at: "2024-03-10T11:05:00Z",
        is_ai_response: true,
      },
      {
        message_id: 3,
        content: "We'll be using Next.js with TypeScript.",
        created_at: "2024-03-10T11:10:00Z",
        is_ai_response: false,
      },
      {
        message_id: 4,
        content:
          "Perfect choice! Here's the setup process:\n\n1. Create Next.js app with TypeScript\n```bash\nnpx create-next-app@latest --typescript\n```\n\n2. Install additional dependencies\n```bash\nnpm install @chakra-ui/react @emotion/react @emotion/styled framer-motion\n```\n\n3. Set up ESLint and Prettier\n\nWould you like me to continue with the configuration steps?",
        created_at: "2024-03-10T11:15:00Z",
        is_ai_response: true,
      },
      {
        message_id: 5,
        content:
          "Great! The development environment is now configured correctly.",
        created_at: "2024-03-10T11:20:00Z",
        is_ai_response: false,
      },
    ],
  },
  {
    // Chat 5: Database Schema Review
    chatInfo: {
      chat_id: 5,
      project_id: 102,
      title: "Database Schema Review",
    },
    projectContext: {
      project_id: 102,
      name: "Customer Portal",
      description: "Building a new customer portal for account management",
    },
    messages: [
      {
        message_id: 1,
        content:
          "Can you review our proposed database schema for the customer portal?",
        created_at: "2024-03-08T13:00:00Z",
        is_ai_response: false,
      },
      {
        message_id: 2,
        content:
          "I'll help you review the database schema. Please share the current schema design.",
        created_at: "2024-03-08T13:05:00Z",
        is_ai_response: true,
      },
      {
        message_id: 3,
        content: "Here's our planned schema: [Schema details shared]",
        created_at: "2024-03-08T13:10:00Z",
        is_ai_response: false,
      },
      {
        message_id: 4,
        content:
          "After reviewing the schema, here are my recommendations:\n\n1. User Table\n- Add indexes for email and username\n- Include soft delete column\n\n2. Orders Table\n- Add status enum\n- Include payment reference\n\n3. Products Table\n- Add inventory tracking\n- Include category foreign key\n\nWould you like me to elaborate on any of these suggestions?",
        created_at: "2024-03-08T13:15:00Z",
        is_ai_response: true,
      },
    ],
  },
  {
    chatInfo: {
      chat_id: 6,
      project_id: null,
      title: "General Programming Questions",
    },
    messages: [
      {
        message_id: 1,
        content: "What's the difference between let and const in JavaScript?",
        created_at: "2024-03-16T10:00:00Z",
        is_ai_response: false,
      },
      {
        message_id: 2,
        content:
          "Let me explain the key differences between let and const:\n\n1. let allows reassignment of values\n2. const creates constants that cannot be reassigned\n3. Both provide block scope\n\nWould you like to see some examples?",
        created_at: "2024-03-16T10:01:00Z",
        is_ai_response: true,
      },
    ],
  },
  {
    chatInfo: {
      chat_id: 7,
      project_id: null,
      title: "Code Review Tips",
    },
    messages: [
      {
        message_id: 1,
        content: "Can you share some best practices for code reviews?",
        created_at: "2024-03-16T11:00:00Z",
        is_ai_response: false,
      },
      {
        message_id: 2,
        content:
          "Here are some key code review best practices:\n\n1. Review code in small chunks\n2. Focus on logic and architecture first\n3. Use automated tools for style checks\n4. Be constructive in feedback\n\nWould you like more specific examples?",
        created_at: "2024-03-16T11:01:00Z",
        is_ai_response: true,
      },
    ],
  },
];

export const mockChatsListData = {
  chats: [
    {
      chat_id: 1,
      project_id: 101,
      title: "Website Redesign Discussion",
      last_message_at: "2024-03-15T09:05:00Z",
      preview: "Would you like me to create a basic wireframe for this layout?",
    },
    {
      chat_id: 2,
      project_id: 101,
      title: "Frontend Component Architecture",
      last_message_at: "2024-03-15T14:30:00Z",
      preview:
        "Let's break down the component structure for the product catalog.",
    },
    {
      chat_id: 3,
      project_id: 102,
      title: "API Integration Planning",
      last_message_at: "2024-03-14T16:45:00Z",
      preview: "Here's the proposed authentication flow using JWT tokens.",
    },
    {
      chat_id: 4,
      project_id: 101,
      title: "Initial Project Setup",
      last_message_at: "2024-03-10T11:20:00Z",
      preview:
        "Great! The development environment is now configured correctly.",
    },
    {
      chat_id: 5,
      project_id: 102,
      title: "Database Schema Review",
      last_message_at: "2024-03-08T13:15:00Z",
      preview:
        "The updated schema looks good. All the necessary relationships are in place.",
    },
    {
      chat_id: 6,
      project_id: null,
      title: "General Programming Questions",
      last_message_at: "2024-03-16T10:01:00Z",
      preview: "Let me explain the key differences between let and const:",
    },
    {
      chat_id: 7,
      project_id: null,
      title: "Code Review Tips",
      last_message_at: "2024-03-16T11:01:00Z",
      preview: "Here are some key code review best practices:",
    },
  ],
  projects: [
    {
      project_id: 101,
      name: "Company Website Redesign",
      description: "Redesigning the company website with modern UI/UX",
    },
    {
      project_id: 102,
      name: "Customer Portal",
      description: "Building a new customer portal for account management",
    },
  ],
};
