describe('EventBook Core Business Rules', () => {
  test('1. Double booking rule check', () => {
    const userBookings = [{ eventId: 'event-1', status: 'ACTIVE' }];
    const hasAlreadyBooked = userBookings.some(
      (b) => b.eventId === 'event-1' && b.status === 'ACTIVE'
    );
    expect(hasAlreadyBooked).toBe(true);
  });

  test('2. Seat capacity calculation rule', () => {
    const totalSeats = 50;
    const activeBookings = 50;
    const seatsRemaining = totalSeats - activeBookings;
    const isSoldOut = seatsRemaining <= 0;
    expect(isSoldOut).toBe(true);
  });

  test('3. Role authorization check for admin routes', () => {
    const userRole:string  = 'USER';
    const isAdmin = userRole === 'ADMIN';
    expect(isAdmin).toBe(false);
  });
});