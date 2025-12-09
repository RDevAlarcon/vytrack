class UserSession {
  final String token;
  // TODO: add companyId/driverId from backend claims when available
  UserSession({required this.token});
}
