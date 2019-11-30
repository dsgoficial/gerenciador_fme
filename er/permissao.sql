  GRANT USAGE ON schema public TO $1:name;
  GRANT SELECT ON ALL TABLES IN SCHEMA public TO $1:name;

  GRANT USAGE ON schema fme TO $1:name;
  GRANT SELECT ON ALL TABLES IN SCHEMA fme TO $1:name;