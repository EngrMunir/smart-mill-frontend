# Rice Mill Management System

A complete admin dashboard for rice mill management built with Next.js 14, TypeScript, and Tailwind CSS.

## 🏭 Features

- **Authentication System**: Login/Register with JWT tokens
- **Dashboard**: Real-time summary cards and charts
- **Farmers Management**: Add farmers and record paddy purchases
- **Production Tracking**: Record paddy to rice/bran conversion
- **Sales Management**: Rice and bran sales with cash/due options
- **External Purchases**: Buy rice/bran from other mills
- **Employee Management**: Staff management and salary payments
- **Reports**: Various business reports and analytics
- **Due Management**: Track farmer and customer dues
- **Stock Management**: Real-time inventory tracking

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Backend API running on port 3000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Login Credentials

- **Email**: smsirajulmonir@gmail.com
- **Password**: *#R@dium1047*# (from Postman collection)

## 🔧 API Integration

The frontend is fully integrated with the backend API from the Postman collection. All data comes directly from the backend API - no mock data is used.

### Environment Configuration

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### API Integration Status

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication | ✅ Complete | JWT tokens |
| Dashboard | ✅ Complete | Real API data |
| Farmers Management | ✅ Complete | CRUD operations |
| Production | ⏳ Pending | Ready for integration |
| Sales | ⏳ Pending | Ready for integration |
| Reports | ⏳ Pending | Ready for integration |
| Employees | ⏳ Pending | Ready for integration |

## 📁 Project Structure

```
├── app/                    # Next.js app router pages
│   ├── login/             # Authentication page
│   ├── farmers/           # Farmers management
│   ├── production/        # Production tracking
│   ├── sales/             # Sales management
│   └── ...
├── components/            # Reusable UI components
├── contexts/              # React contexts (Auth)
├── lib/                   # Utility functions and API services
│   ├── api.ts            # API service layer
│   ├── types.ts          # TypeScript interfaces
│   └── ...
└── ...
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
