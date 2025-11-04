using BookingService.Dtos;
using BookingService.Entities;
using BookingService.Enums;

namespace BookingService.Helpers;

public static class BookingHelper
{
    public static void PopulateBookingDetailsAndTotal(
        BookingEntity booking,
        CreateBookingDto createBookingDto,
        TourPricingDto pricing)
    {
        booking.TotalPrice = 0;
        booking.BookingDetails.Clear();

        foreach (var d in createBookingDto.BookingDetails)
        {
            if (d.Quantity <= 0)
                continue;

            decimal unitPrice = d.ParticipantType switch
            {
                ParticipantType.Adult => pricing.PricePerAdult,
                ParticipantType.Child => pricing.PricePerChild,
                ParticipantType.Infant => 0,
                _ => 0
            };

            var detail = new BookingDetailEntity
            {
                ParticipantType = d.ParticipantType,
                Quantity = d.Quantity,
                UnitPrice = unitPrice
            };

            booking.BookingDetails.Add(detail);
            booking.TotalPrice += unitPrice * d.Quantity;
        }
    }
}
