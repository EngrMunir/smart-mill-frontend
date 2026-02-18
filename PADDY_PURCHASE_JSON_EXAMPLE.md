# ধান কেনার সময় Backend-এ পাঠানো JSON ডেটা

## API Endpoint
```
POST http://localhost:3000/paddy/purchases
```

## Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <your_jwt_token>"
}
```

## Request Body (JSON Example)

### উদাহরণ ১: একটি বস্তা দিয়ে কেনা (পূর্ণ পরিশোধ)

```json
{
  "farmerId": 1,
  "paddyTypeId": 1,
  "purchaseDate": "2024-01-15",
  "totalBosta": 1,
  "totalWeight": 48.5,
  "pricePerKg": 35.50,
  "totalPrice": 1721.75,
  "paidAmount": 1721.75,
  "notes": "Purchase from রহিম উদ্দিন"
}
```

### উদাহরণ ২: একাধিক বস্তা দিয়ে কেনা (আংশিক পরিশোধ)

```json
{
  "farmerId": 2,
  "paddyTypeId": 1,
  "purchaseDate": "2024-01-15",
  "totalBosta": 4,
  "totalWeight": 195,
  "pricePerKg": 35.00,
  "totalPrice": 6825,
  "paidAmount": 5000.00,
  "notes": "Purchase from করিম উদ্দিন"
}
```

### উদাহরণ ৩: অনেক বস্তা দিয়ে কেনা (কোনো পরিশোধ নেই)

```json
{
  "farmerId": 3,
  "paddyTypeId": 2,
  "purchaseDate": "2024-01-16",
  "totalBosta": 8,
  "totalWeight": 389.2,
  "pricePerKg": 37.50,
  "totalPrice": 14595,
  "paidAmount": 0,
  "notes": "Purchase from সেলিম উদ্দিন"
}
```

## Field Descriptions (ফিল্ডের বিবরণ)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `farmerId` | number | Yes | কৃষকের ID (Database-এর users table থেকে) |
| `paddyTypeId` | number | Yes | ধানের ধরনের ID (paddy_types table থেকে) |
| `purchaseDate` | string | Yes | কেনার তারিখ (Format: "YYYY-MM-DD") |
| `totalBosta` | number | Yes | মোট বস্তার সংখ্যা |
| `totalWeight` | number | Yes | মোট ওজন (কেজিতে) |
| `pricePerKg` | number | Yes | প্রতি কেজির দাম (টাকায়) |
| `totalPrice` | number | Yes | মোট টাকা (totalWeight × pricePerKg) |
| `paidAmount` | number | No | পরিশোধিত টাকার পরিমাণ (ঐচ্ছিক, default: 0) |
| `notes` | string | No | অতিরিক্ত নোট (ঐচ্ছিক) |

## Frontend থেকে Data Preparation

Frontend-এ এইভাবে ডেটা প্রস্তুত করা হয়:

```javascript
// Form data থেকে - UI-তে individual bostas থাকলেও API-তে total হিসাবে পাঠানো হয়
const totalBosta = purchaseForm.bostas.length;
const totalWeight = purchaseForm.bostas.reduce((sum, b) => sum + parseFloat(b.weightKg.toString() || '0'), 0);

const paidAmount = parseFloat(purchaseForm.paidAmount) || 0;

const pricePerKg = parseFloat(purchaseForm.ratePerKg) || 0;
const totalPrice = totalWeight * pricePerKg;
const paidAmount = parseFloat(purchaseForm.paidAmount) || 0;

const purchaseData = {
  farmerId: parseInt(purchaseForm.farmerId),        // "1" → 1
  paddyTypeId: parseInt(paddyTypeId),              // "1" → 1
  purchaseDate: new Date().toISOString().split('T')[0], // "2024-01-15"
  totalBosta: totalBosta,                          // মোট বস্তার সংখ্যা
  totalWeight: totalWeight,                        // মোট ওজন (কেজি)
  pricePerKg: pricePerKg,                         // "35.50" → 35.50
  totalPrice: totalPrice,                          // মোট টাকা (totalWeight × pricePerKg)
  paidAmount: paidAmount,                          // পরিশোধিত টাকা (ঐচ্ছিক)
  notes: `Purchase from ${purchaseForm.farmerName}`
};
```

## Expected Backend Response

### Success Response (200 OK)

```json
{
  "data": {
    "id": 1,
    "farmerId": 1,
    "paddyTypeId": 1,
    "purchaseDate": "2024-01-15",
    "totalKg": 194.0,
    "totalBosta": 4,
    "pricePerKg": 35.50,
    "totalAmount": 6887.00,
    "paidAmount": 0,
    "dueAmount": 6887.00,
    "bostas": [
      {
        "bostaNumber": 1,
        "weight": 48.5
      },
      {
        "bostaNumber": 2,
        "weight": 49.2
      },
      {
        "bostaNumber": 3,
        "weight": 47.8
      },
      {
        "bostaNumber": 4,
        "weight": 50.0
      }
    ],
    "notes": "Purchase from রহিম উদ্দিন",
    "farmer": {
      "id": 1,
      "name": "রহিম উদ্দিন",
      "phone": "01712345678",
      "address": "ঢাকা"
    },
    "paddyType": {
      "id": 1,
      "name": "২৮",
      "description": "২৮ নম্বর ধান"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Response (400/500)

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## Calculation Example (গণনার উদাহরণ)

যদি ৪টি বস্তা কেনা হয়:
- বস্তা ১: 48.5 কেজি
- বস্তা ২: 49.2 কেজি
- বস্তা ৩: 47.8 কেজি
- বস্তা ৪: 50.0 কেজি

**মোট কেজি** = 48.5 + 49.2 + 47.8 + 50.0 = **195.5 কেজি**

**মোট বস্তা** = 4

**দর প্রতি কেজি** = 35.50 টাকা

**মোট টাকা** = 195.5 × 35.50 = **6,940.25 টাকা**

**পরিশোধিত টাকা** = 5000.00 টাকা (user input)

**বাকি টাকা** = 6,940.25 - 5,000.00 = **1,940.25 টাকা**

## Step 2: Pay Remaining Amount (বাকি টাকা পরিশোধ)

যদি initial purchase-এ partial payment করা হয়, তাহলে পরে বাকি টাকা পরিশোধ করতে এই API ব্যবহার করুন:

### API Endpoint
```
POST {{base_url}}/payments/paddy-purchases/:id/pay
```

### Request Body

```json
{
  "amount": 1850
}
```

### Example

```json
POST {{base_url}}/payments/paddy-purchases/1/pay
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
  "amount": 1850
}
```

### Success Response (200 OK)

```json
{
  "message": "Payment successful",
  "data": {
    "id": 1,
    "purchaseId": 1,
    "amount": 1850,
    "paymentDate": "2024-01-16T10:30:00.000Z",
    "createdAt": "2024-01-16T10:30:00.000Z"
  }
}
```

### Frontend Implementation

```javascript
// Pay remaining amount for a paddy purchase
await paymentsAPI.payPaddyPurchase(purchaseId, amount);
```

## Notes (নোট)

1. `totalBosta` অবশ্যই ১ বা তার বেশি হতে হবে
2. `totalWeight` positive number হতে হবে (কেজিতে)
3. `purchaseDate` ISO format-এ থাকবে (YYYY-MM-DD)
4. `farmerId` এবং `paddyTypeId` অবশ্যই valid database ID হতে হবে
5. `pricePerKg` positive number হতে হবে
6. `totalPrice` automatically calculated হবে (totalWeight × pricePerKg)
7. `paidAmount` optional, যদি না দেওয়া হয় তাহলে 0 ধরা হবে
8. **UI-তে** ব্যবহারকারী individual bostas যোগ করবে, কিন্তু **API-তে** `totalBosta` এবং `totalWeight` হিসাবে পাঠানো হবে
9. **UI-তে** পরিশোধিত টাকা (paidAmount) দেওয়া যায়, যা API-তে পাঠানো হবে
10. **বাকি টাকা পরিশোধ** করতে `POST /payments/paddy-purchases/:id/pay` endpoint ব্যবহার করুন


