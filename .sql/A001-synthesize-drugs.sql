CREATE TABLE drug (
	id serial primary key,
	generic_name varchar,
	brand_name varchar,
	drug_class varchar,
	schedule varchar,
	released_on date DEFAULT '1970-01-01'::date
);

CREATE TABLE drug_inventory (
    id SERIAL PRIMARY KEY,
    drug_id integer REFERENCES drug(id) UNIQUE,
    pills_in_stock integer DEFAULT 0,
    max_pill_stock_capacity integer DEFAULT 2000,
    last_order_filled_at timestamp with time zone DEFAULT '2022-06-01 00:00:00+00'::timestamp with time zone,
    last_audit_at timestamp with time zone DEFAULT '2022-06-01 00:00:00+00'::timestamp with time zone
);
