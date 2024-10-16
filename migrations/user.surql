USE NS test DB test;

DEFINE TABLE user SCHEMAFULL
  PERMISSIONS
    FOR create WHERE $auth.role = "admin",
    FOR select, update, delete WHERE id = $auth.id OR $auth.role = "admin";

DEFINE FIELD email ON user TYPE string ASSERT string::is::email($value);
DEFINE FIELD name ON user TYPE string;
DEFINE FIELD role ON user TYPE option<string>
  ASSERT role IN ["admin"]
  PERMISSIONS FOR update WHERE $auth.role = "admin" AND $auth.id != id;

DEFINE FIELD auth_until ON user TYPE option<datetime>
  DEFAULT time::ceil(time::now() + 24w, 1d)
  PERMISSIONS FOR create, update WHERE $auth.role = "admin";

DEFINE FIELD username ON user TYPE string;
DEFINE FIELD password ON TABLE user TYPE string
  VALUE $before OR crypto::argon2::generate($value)
  PERMISSIONS
    FOR select NONE
    FOR update WHERE $auth.role = "admin";

DEFINE INDEX email_index ON user FIELDS email UNIQUE;
DEFINE INDEX username_index ON user FIELDS username UNIQUE;
