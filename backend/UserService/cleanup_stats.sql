-- Remove "Unknown" key from PaymentMethodDistribution JSON column
UPDATE "DashboardStats"
SET "PaymentMethodDistribution" = "PaymentMethodDistribution"::jsonb - 'Unknown';
