START TRANSACTION;
ALTER TABLE "Bookings" ADD "PaymentMethod" character varying(50);

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260130173616_AddPaymentMethodToBookings', '9.0.9');

COMMIT;

