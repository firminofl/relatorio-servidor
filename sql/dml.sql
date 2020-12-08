do $$
declare
dating timestamp;
dating2 timestamp;                          
begin
for r in 1..30 loop
	dating := '2020-11-' || r || ' 00:00:00.00000';
	dating2 := '2020-11-' || r || ' 23:59:59.00000';
	INSERT INTO status(status, data_hora) VALUES ('REG', dating);
	INSERT INTO status(status, data_hora) VALUES ('NRE', dating2);
end loop;
end;
$$;

INSERT INTO status(status, data_hora) VALUES ('REG', '2020-11-10 16:43:00');
INSERT INTO status(status, data_hora) VALUES ('NRE', '2020-11-15 16:43:00');
SELECT AGE('2020-11-15 16:43', '2020-11-10 16:42');

CREATE OR REPLACE FUNCTION get_all_foo() RETURNS SETOF interval AS
$BODY$
declare
dating timestamp;
dating2 timestamp;                          
begin
for r in 1..29 loop
	dating := '2020-11-' || r || ' 00:00:00';
	dating2 := '2020-11-' || r || ' 23:59:59';
	RETURN QUERY SELECT AGE(dating2, dating);
end loop;
end;
$BODY$
LANGUAGE plpgsql;

SELECT * FROM get_all_foo();

DROP TABLE status;
CREATE TABLE status(
	id BIGSERIAL NOT NULL,
	status CHARACTER VARYING(3) NOT NULL,
	data_hora TIMESTAMP NOT NULL,
	PRIMARY KEY (id)
);

SELECT status, data_hora FROM 
(SELECT status, data_hora FROM status as s 
WHERE s.data_hora BETWEEN 
'2020-11-01 00:00:00' AND 
'2020-11-30 23:59:59' 
ORDER BY data_hora ASC) as DATAS;

SELECT * FROM status;

SELECT AGE('2020-11-15 16:43:00','2020-11-10 16:43:00');
SELECT AGE('2020-11-18 17:54:19', '2020-11-15 16:43:00');
SELECT AGE('2020-11-18 18:11:03', '2020-11-18 17:54:19');
SELECT INTERVAL'0 days' + INTERVAL'00:11:19';

create or replace function test3() RETURNS SETOF text
as $$
declare
  r record;
  nextStatus text; 
begin
    FOR r IN SELECT * FROM status as s WHERE s.data_hora BETWEEN '2020-11-01 00:00:00' AND '2020-11-30 23:59:59' ORDER BY data_hora ASC LOOP

	nextStatus := (SELECT LEAD(r.status) OVER ( ORDER BY r.data_hora ) AS NextStatus FROM status as s);

	RETURN NEXT nextStatus;
    END LOOP;
end;
$$ language plpgsql;
--test output
select * from test3();

--DELETE FROM status;