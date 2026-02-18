# ধান কেনার সময় Backend-এ পাঠানো Data Structure

## Data Format

যখন আপনি ধান কেনার form submit করেন, তখন backend-এ নিম্নলিখিত format-এ data পাঠানো হয়:

```json
{
  "farmerId": 1,
  "paddyTypeId": 2,
  "purchaseDate": "2024-01-15",
  "bostas": [
    {
      "bostaNumber": 1,
      "weight": 50.5
    },
    {
      "bostaNumber": 2,
      "weight": 48.2
    },
    {
      "bostaNumber": 3,
      "weight": 52.0
    }
  ],
  "pricePerKg": 35.50,
  "notes": "Purchase from কৃষকের নাম"
}
```

## Field Details

### 1. `farmerId` (number)
- **Type:** Integer
- **Description:** কৃষকের ID
- **Example:** `1`, `2`, `3`
- **Source:** Form থেকে selected farmer-এর ID

### 2. `paddyTypeId` (number)
- **Type:** Integer
- **Description:** ধানের ধরনের ID
- **Example:** `1`, `2`, `3`
- **Source:** Form থেকে selected paddy type-এর ID

### 3. `purchaseDate` (string)
- **Type:** String (ISO Date Format: YYYY-MM-DD)
- **Description:** কেনার তারিখ
- **Example:** `"2024-01-15"`
- **Format:** `YYYY-MM-DD`
- **Source:** Automatically generated from current date

### 4. `bostas` (array)
- **Type:** Array of Objects
- **Description:** প্রতিটি বস্তার বিবরণ
- **Structure:**
  ```json
  [
    {
      "bostaNumber": 1,
      "weight": 50.5
    }
  ]
  ```
- **Fields:**
  - `bostaNumber` (number): বস্তার নম্বর (1, 2, 3...)
  - `weight` (number): বস্তার ওজন কেজিতে (decimal allowed)

### 5. `pricePerKg` (number)
- **Type:** Number (Decimal)
- **Description:** প্রতি কেজির দাম
- **Example:** `35.50`, `40.00`
- **Source:** Form থেকে input করা দর

### 6. `notes` (string, optional)
- **Type:** String
- **Description:** অতিরিক্ত নোট
- **Example:** `"Purchase from কৃষকের নাম"`
- **Source:** Automatically generated from farmer name

## Example Request

### Complete Example:

```json
{
  "farmerId": 5,
  "paddyTypeId": 3,
  "purchaseDate": "2024-12-20",
  "bostas": [
    {
      "bostaNumber": 1,
      "weight": 50.0
    },
    {
      "bostaNumber": 2,
      "weight": 48.5
    },
    {
      "bostaNumber": 3,
      "weight": 52.0
    },
    {
      "bostaNumber": 4,
      "weight": 49.5
    }
  ],
  "pricePerKg": 38.75,
  "notes": "Purchase from রহিম উদ্দিন"
}
```

## API Endpoint

- **URL:** `POST /paddy/purchases`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer <token>
  ```

## Console Logs

আপনি যখন form submit করবেন, browser console-এ (F12) নিম্নলিখিত logs দেখবেন:

1. **Data Structure Logs:**
   - Full Purchase Data (formatted JSON)
   - Individual field values
   - Data types
   - Bostas array structure

2. **API Call Logs:**
   - Endpoint URL
   - Request method
   - Request body
   - Response status
   - Response data

## Backend-এ Expected Response

Backend থেকে expected response format:

```json
{
  "data": {
    "id": 1,
    "farmerId": 5,
    "paddyTypeId": 3,
    "purchaseDate": "2024-12-20",
    "totalKg": 200.0,
    "totalBosta": 4,
    "pricePerKg": 38.75,
    "totalAmount": 7750.0,
    "paidAmount": 0,
    "dueAmount": 7750.0,
    "bostas": [
      {
        "bostaNumber": 1,
        "weight": 50.0
      },
      {
        "bostaNumber": 2,
        "weight": 48.5
      },
      {
        "bostaNumber": 3,
        "weight": 52.0
      },
      {
        "bostaNumber": 4,
        "weight": 49.5
      }
    ],
    "notes": "Purchase from রহিম উদ্দিন",
    "createdAt": "2024-12-20T10:30:00.000Z",
    "updatedAt": "2024-12-20T10:30:00.000Z"
  }
}
```

## Testing

1. Browser console খুলুন (F12)
2. Farmers page-এ যান
3. "নতুন কেনা" button click করুন
4. Form fill করুন
5. Submit করুন
6. Console-এ logs দেখুন

## Notes

- সব numeric values number type-এ পাঠানো হয় (string নয়)
- Date format: `YYYY-MM-DD` (ISO date format)
- Bostas array-তে প্রতিটি বস্তার জন্য `bostaNumber` এবং `weight` required
- `pricePerKg` decimal value হতে পারে

