# RLS Security Notes

- Client role can only read own profile, transactions, and match participation rows.
- Wallet balance is never writable from client SQL policies.
- Only server-side service role triggers wallet updates via increment_wallet_balance.
- Match result writes should be idempotent by matches.id.
