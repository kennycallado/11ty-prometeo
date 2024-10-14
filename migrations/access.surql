USE NS test DB test;

DEFINE ACCESS user ON DATABASE TYPE RECORD
  SIGNIN (
    SELECT * FROM user
      WHERE username = $username
        AND crypto::argon2::compare(password, $password)
        AND (auth_until > time::now() OR role IS "admin")
  ) DURATION FOR TOKEN 2w;
