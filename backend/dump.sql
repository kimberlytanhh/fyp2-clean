--
-- PostgreSQL database dump
--

\restrict As0de6knUwSr0sbTX1GVAjQnBGx7l9WGYysjTffUUTAWpKPQHtScgehppGGBQyh

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    content text NOT NULL,
    user_id integer NOT NULL,
    report_id integer NOT NULL,
    created_at timestamp without time zone
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO postgres;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    actor_name character varying NOT NULL,
    type character varying NOT NULL,
    report_id integer,
    is_read boolean,
    created_at timestamp with time zone DEFAULT now(),
    message text
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: reactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reactions (
    id integer NOT NULL,
    type character varying NOT NULL,
    user_id integer NOT NULL,
    report_id integer NOT NULL
);


ALTER TABLE public.reactions OWNER TO postgres;

--
-- Name: reactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reactions_id_seq OWNER TO postgres;

--
-- Name: reactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reactions_id_seq OWNED BY public.reactions.id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    id integer NOT NULL,
    title character varying NOT NULL,
    description text NOT NULL,
    status character varying NOT NULL,
    predicted_category character varying,
    confidence_score double precision,
    user_id integer NOT NULL,
    location character varying NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    image_path character varying,
    created_at timestamp without time zone,
    text_category character varying,
    text_confidence double precision,
    image_category character varying,
    image_confidence double precision,
    final_category character varying,
    needs_review boolean
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reports_id_seq OWNER TO postgres;

--
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    password_hash character varying NOT NULL,
    role character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: reactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reactions ALTER COLUMN id SET DEFAULT nextval('public.reactions_id_seq'::regclass);


--
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, content, user_id, report_id, created_at) FROM stdin;
2	OMG! Luckily i saw this before passing by that area, will definitely avoid. Thank you so much!	3	23	2026-04-15 11:51:23.984303
3	Authorities have solved this problem. Super speedy	4	2	2026-04-15 11:52:32.499453
4	Oh no hope everyone ok stay safe	5	1	2026-04-15 11:53:28.651072
5	Very foul smell walking past this place	6	6	2026-04-15 12:00:50.9791
6	Whole kampar become a lake haha	7	20	2026-04-15 12:02:25.347136
7	tq	15	23	2026-04-15 12:03:00.515179
8	Are they gone now?	15	8	2026-04-15 12:03:35.681869
9	Just drove past - yes they are.	18	8	2026-04-15 12:04:18.392878
10	lol	19	20	2026-04-15 12:04:47.416382
11	Stuck in the jam for the past 1 hour, need toilet la	19	11	2026-04-15 12:05:52.443238
12	I saw this too, hope no one stuck inside	21	21	2026-04-15 12:10:36.354349
13	I fell down here.	10	14	2026-04-15 12:11:31.843082
14	Me too.	3	14	2026-04-15 12:11:54.415842
15	Hope you find it soon :) will look out for it	12	26	2026-04-15 12:19:04.203512
16	I found it~ I left it at the Econsave customer service desk, you may collect it from there!	16	26	2026-04-15 12:20:05.720869
17	YAy thank you so muchh	2	26	2026-04-15 12:20:37.441002
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, actor_name, type, report_id, is_read, created_at, message) FROM stdin;
1	21	Penny Ang	like	23	f	2026-04-15 19:50:08.104422+08	\N
2	21	Penny Ang	comment	23	f	2026-04-15 19:50:36.04669+08	\N
3	21	Penny Ang	comment	23	f	2026-04-15 19:51:23.9867+08	\N
4	3	Angeline Tan	comment	1	f	2026-04-15 19:53:28.652682+08	\N
5	5	Benjamin Tan	comment	6	f	2026-04-15 20:00:50.980913+08	\N
6	5	Benjamin Tan	like	6	f	2026-04-15 20:00:52.524034+08	\N
7	18	Benjamin Tan	like	19	f	2026-04-15 20:01:16.660367+08	\N
8	16	Benjamin Tan	like	17	f	2026-04-15 20:01:22.652155+08	\N
9	14	Benjamin Tan	like	15	f	2026-04-15 20:01:26.076257+08	\N
10	12	Benjamin Tan	like	13	f	2026-04-15 20:01:29.931608+08	\N
11	13	Benjamin Tan	like	14	f	2026-04-15 20:01:34.595562+08	\N
12	13	Benjamin Tan	like	14	f	2026-04-15 20:01:35.264978+08	\N
13	13	Benjamin Tan	like	14	f	2026-04-15 20:01:36.001005+08	\N
14	13	Benjamin Tan	dislike	14	f	2026-04-15 20:01:37.08256+08	\N
15	13	Benjamin Tan	like	14	f	2026-04-15 20:01:38.057076+08	\N
16	19	Nijel Tan	like	20	f	2026-04-15 20:02:08.435713+08	\N
17	19	Nijel Tan	comment	20	f	2026-04-15 20:02:25.348668+08	\N
18	21	Megan Lim	comment	23	f	2026-04-15 20:03:00.516822+08	\N
19	7	Megan Lim	like	8	f	2026-04-15 20:03:31.02074+08	\N
20	7	Megan Lim	comment	8	f	2026-04-15 20:03:35.68383+08	\N
21	7	Elizabeth Tan	like	8	f	2026-04-15 20:04:03.921671+08	\N
22	7	Elizabeth Tan	comment	8	f	2026-04-15 20:04:18.394342+08	\N
23	10	Keeron Raj	like	11	f	2026-04-15 20:05:22.204132+08	\N
24	10	Keeron Raj	comment	11	f	2026-04-15 20:05:52.444659+08	\N
25	20	Amanda Lau	like	21	f	2026-04-15 20:10:21.133807+08	\N
26	20	Amanda Lau	comment	21	f	2026-04-15 20:10:36.355913+08	\N
27	13	Krishnenthiren a/l Chandran	like	14	f	2026-04-15 20:11:12.266213+08	\N
28	13	Krishnenthiren a/l Chandran	comment	14	f	2026-04-15 20:11:31.844716+08	\N
29	13	Penny Ang	comment	14	f	2026-04-15 20:11:54.417347+08	\N
30	2	Sharmine Hanna	like	26	f	2026-04-15 20:18:22.283732+08	\N
31	2	Sharmine Hanna	comment	26	f	2026-04-15 20:19:04.205004+08	\N
32	2	Jenny Lim	like	26	f	2026-04-15 20:19:25.873449+08	\N
33	2	Jenny Lim	comment	26	f	2026-04-15 20:20:05.722276+08	\N
35	2	Admin	rejected	27	t	2026-04-15 20:45:24.609091+08	Your report 'this system is so useless' has been rejected
\.


--
-- Data for Name: reactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reactions (id, type, user_id, report_id) FROM stdin;
1	like	3	23
2	like	4	2
3	like	6	6
4	like	6	19
5	like	6	17
6	like	6	15
7	like	6	13
8	like	6	14
9	like	7	20
10	like	15	8
11	like	18	8
12	like	19	11
13	like	21	21
14	like	10	14
15	like	12	26
16	like	16	26
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reports (id, title, description, status, predicted_category, confidence_score, user_id, location, latitude, longitude, image_path, created_at, text_category, text_confidence, image_category, image_confidence, final_category, needs_review) FROM stdin;
1	Car Collision at Traffic Light	Two cars collided at the main traffic light intersection, causing minor injuries and blocking traffic.	approved	\N	\N	3	Jalan Kampar Putra, Kampar Putra, Kampar, Perak, 31900, Malaysia	4.325143390197614	101.1257813815415	uploads\\f2c7a5ab-2868-4fa5-a6d7-1a6bb5df0751.jpg	2026-04-14 08:45:05.551469	\N	\N	accident	0.9005164504051208	accident	t
2	Blocked Drain Causing Flood	The roadside drain is clogged with debris, causing water to overflow onto the road after rainfall.	approved	\N	\N	4	Jalan Seksyen 1/1, Kampung Tanjung Rengas, Kampar, Perak, 31900, Malaysia	4.33072787269157	101.13682969105756	uploads\\1520034f-454e-4b02-9a83-61a00fd3f145.webp	2026-04-14 08:48:42.768174	\N	\N	road_damage	0.9644067883491516	road_damage	t
7	Fallen Tree Blocking Road	A tree has fallen across the road, blocking one lane and disrupting traffic flow.	approved	\N	\N	6	Song Bak Foundation Outpatient Specialist Centre, Jalan Universiti, Kampung Tanjung Rengas, Kampar, Perak, 31900, Malaysia	4.3353280859310654	101.13496157201843	uploads\\88630e8d-6b9b-4455-bc4c-9130f3922406.jpg	2026-04-14 08:56:09.732071	\N	\N	obstruction_fallen_tree	0.9956293106079102	obstruction_fallen_tree	t
8	Police Roadblock Near Highway	Police officers have set up a roadblock near the highway to conduct vehicle inspections.	approved	\N	\N	7	Kampung Tanjung Rengas, Kampar, Perak, 31900, Malaysia	4.327603991008905	101.13470424264858	uploads\\73ffc05a-d2f6-4eb9-9d86-cebbacb17e4e.jpg	2026-04-14 08:59:15.686631	\N	\N	police_sighting	0.8920217156410217	police_sighting	t
9	Cracked Road Surface	The road surface is cracked and uneven, creating unsafe driving conditions.	approved	\N	\N	8	Jalan Seksyen 4/6, Kampung Tanjung Rengas, Kampar, Perak, 31900, Malaysia	4.327497008531188	101.13463883651518	uploads\\92c5d253-9b62-4140-82c5-2181c7007b14.webp	2026-04-14 09:01:42.534724	\N	\N	road_damage	0.9971516728401184	road_damage	t
10	Noisy Group Late at Night	A group of people are making loud noise in the neighborhood late at night, disturbing residents.	approved	\N	\N	9	Jalan Seksyen 1/3, Kampung Tanjung Rengas, Kampar, Perak, 31900, Malaysia	4.329433389038243	101.13538272991077	\N	2026-04-14 09:07:06.115228	\N	\N	\N	\N	\N	t
11	Heavy Traffic During Peak Hours	Traffic congestion is very severe during peak hours, causing long delays for commuters.	approved	\N	\N	10	Jalan Universiti, Kampung Tanjung Rengas, Kampar, Perak, 31900, Malaysia	4.333509400320965	101.13485466599246	uploads\\4520f26f-3fb5-48d6-89e5-c689f7c39a6d.jpg	2026-04-14 09:09:15.321316	\N	\N	accident	0.9024709463119507	accident	t
12	Power Outage in Neighborhood	Electricity has been cut off in the area since morning, affecting homes and businesses.	approved	\N	\N	11	Jalan Seksyen 1/1, Kampung Tanjung Rengas, Kampar, Perak, 31900, Malaysia	4.330797411006969	101.13716424138997	uploads\\f3469230-2d0b-4dad-a41b-5840e01c5964.png	2026-04-14 09:11:04.604699	\N	\N	accident	0.8757407665252686	accident	t
13	Air Pollution from Burning Waste	Open burning of waste is causing thick smoke and affecting air quality in the area.	approved	\N	\N	12	Jalan Kolej, Kampar, Perak, 31900, Malaysia	4.331113007896487	101.1444498979459	uploads\\89ca04f2-5439-4c30-8e79-c0f65bd508ce.webp	2026-04-14 09:13:31.06356	\N	\N	garbage	0.6829744577407837	garbage	t
14	Broken Pedestrian Walkway	The pedestrian walkway is damaged, making it unsafe for people to walk.	approved	\N	\N	13	Sekolah Agama Rakyat As-Syuhada, Jalan Batu Hijau 3, Kampar Putra, Kampar, Perak, 31900, Malaysia	4.327176061007328	101.14153048312942	uploads\\2ef9ce71-aca4-46a6-8691-d34811b81552.jpeg	2026-04-14 09:18:48.341588	\N	\N	other	0.38306668400764465	other	t
15	Garbage Accumulation At The side of the Road	Large amounts of garbage have been left uncollected near shop lots, creating a foul smell.	approved	\N	\N	14	Jalan Batu Hijau, Kampar Putra, Kampar, Perak, 31900, Malaysia	4.328481246755978	101.14172331746119	uploads\\01a2a717-00ed-4d19-b604-2b1b76341735.jpg	2026-04-14 09:21:42.394954	\N	\N	garbage	0.9999481439590454	garbage	t
6	Uncollected trash for days	Trash has not been collected for several days, causing hygiene issues and unpleasant conditions	approved	\N	\N	5	Jalan Seksyen 2/8, Kampung Tanjung Rengas, Kampar, Perak, 31900, Malaysia	4.331701408525411	101.13091903382104	uploads\\25b791a3-fb74-4a8e-9749-29445a2fa82d.jpg	2026-04-14 08:54:31.899272	\N	\N	garbage	0.9772317409515381	garbage	t
5	stupid	i hate u	rejected	\N	\N	5	Jalan Kampar Putra, Kampar Putra, Kampar, Perak, 31900, Malaysia	4.322267	101.125748	\N	2026-04-14 08:53:53.144747	\N	\N	\N	\N	\N	t
16	Damaged Road Sign	A road sign has fallen after the storm yesterday, this may cause confusion for drivers.	approved	\N	\N	15	Block B	4.336323012075548	101.14121764899113	uploads\\4d310bb2-0d8a-48b5-b591-c1bc3866223b.jpg	2026-04-14 09:29:14.412709	\N	\N	infrastructure_damage	0.701485276222229	infrastructure_damage	t
17	Serious Accident Report	There is a bad accident that just happened here, one is severely injured, paramedics on their way. Many accidents often happen here, authorities should look into it.	approved	\N	\N	16	Jalan Batu Sinar, Taman Bandar Baru Selatan, Kampar Putra, Kampar, Perak, 31900, Malaysia	4.326462286599429	101.14000830799343	uploads\\ae8ee24b-2fa5-4577-98b6-23d7f286d306.jpg	2026-04-14 11:32:51.74084	\N	\N	accident	0.9629855751991272	accident	t
18	Suspicious Person Near Residential Area	A person has been seen walking around the neighborhood repeatedly and looking into parked cars. Residents nearby seem concerned. Everyone please be aware of your surroundings.	approved	\N	\N	17	Jalan Batu Hijau, Kampar Putra, Kampar, Perak, 31900, Malaysia	4.328245885557761	101.1413157240315	\N	2026-04-14 17:31:18.939038	\N	\N	\N	\N	\N	t
19	Motorcycle Accident on Main Road	A motorcyclist fell after hitting being hit my a car on the road in front of block A. Seems to be a hit and run. A few people stopped to help, and traffic slowed down briefly. If anyone has dashcam footage, please do reach out to any uni admin staff.	approved	\N	\N	18	Jalan Universiti, Kampar, Perak, 31900, Malaysia	4.335199708266828	101.1416972393884	uploads\\0a2dbda9-e80b-4e9c-89ff-94f5d60b15bb.webp	2026-04-14 17:36:06.331166	\N	\N	road_damage	0.9705811738967896	road_damage	t
20	Water Leak from Pipe	There seems to be a water leak coming from underground pipe near the sidewalk. Water is flowing continuously and might damage the road.	approved	\N	\N	19	Jalan Batu Karang, Kampar Lake Campus Condominium (K.L.C.C), Kampar, Perak, 31900, Malaysia	4.330770665501808	101.14634686679933	uploads\\7c405300-31c1-487a-8811-63ff9b7427ee.avif	2026-04-14 17:39:06.762278	\N	\N	road_damage	0.9363846182823181	road_damage	t
21	Fire	Smoke was seen coming from one of the restaurants nearby which turned into a big fire. People were gathering outside, and emergency services may be needed.	approved	\N	\N	20	Kam Heong Food, Jalan Kolej, Kampar, Perak, 31900, Malaysia	4.330599494246366	101.14380606468372	uploads\\ee9595bc-c986-4791-b0f8-7248225f56ec.jpeg	2026-04-14 17:42:02.463229	\N	\N	infrastructure_damage	0.6955572962760925	infrastructure_damage	t
22	Loud Disturbance Late at Night	There was loud shouting and disturbance in Unisuites. Sounds like people arguing and throwing things. It may require attention to ensure safety. Anyone else heard it? Are the people okay?	approved	\N	\N	21	Jalan Jaya 1, Taman Kampar Siswa, Kampar, Perak, 31900, Malaysia	4.329101744109576	101.14798460099013	\N	2026-04-14 17:45:38.907694	\N	\N	\N	\N	\N	t
23	BEWARE POLICE BLOCKING	Police blocking in front of Champs Elysees! Be aware, make sure not using handphone	approved	\N	\N	21	Jalan Kampar Putra, Kampar Putra, Kampar, Perak, 31900, Malaysia	4.324854536534633	101.125769589247	uploads\\36ed5f0d-05e6-4224-be3d-767a22b99e46.webp	2026-04-14 17:50:32.881474	\N	\N	police_sighting	0.9868354797363281	police_sighting	t
24	stupid kids	All these stupid kids playing outside my house. They are being so noisy!	flagged	\N	\N	2	Jalan Kampar Putra, Kampar Putra, Kampar, Perak, 31900, Malaysia	4.321761458675175	101.12576242054087	\N	2026-04-15 11:48:08.842864	\N	\N	\N	\N	\N	t
25	F**K	blablabla	flagged	\N	\N	2	Jalan Kampar Putra, Kampar Putra, Kampar, Perak, 31900, Malaysia	4.321761458675175	101.12576242054087	\N	2026-04-15 11:48:33.138205	\N	\N	\N	\N	\N	t
26	Help me find my wallet	Hello everyone, Ive lost my wallet. The last time i remember having it was at Econsave at around 3.30pm. If anyone has seen it please let me know, I have attached an image of it	approved	\N	\N	2	Econsave, Jalan Batu Karang, Kampar Lake Campus Condominium (K.L.C.C), Kampar, Perak, 31900, Malaysia	4.327240250522992	101.14700431251276	uploads\\145cdef6-0a62-4989-961d-eb5c03a983d3.jpg	2026-04-15 12:17:51.111646	\N	\N	infrastructure_damage	0.6806052327156067	infrastructure_damage	t
27	this system is so useless	system for idiots only	rejected	\N	\N	2	Jalan Kampar Putra, Kampar Putra, Kampar, Perak, 31900, Malaysia	4.321620126557278	101.12584272288058	\N	2026-04-15 12:30:09.049157	\N	\N	\N	\N	\N	t
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password_hash, role) FROM stdin;
1	System Admin	admin@example.com	$2b$12$qEoVhjUWwGSflLAlukbjge/Lky326vHRRiW.7gl2RU2qE8bGpm5ru	admin
2	Kimberly Tan	kim@example.com	$2b$12$je6aOrvcQPbOovV9jPlSFe6oUkkVZu7B1L1jE/4Ax1/v23hr8ghiC	user
3	Penny Ang	penny@example.com	$2b$12$CZnHfguVjMm.e4f0ieyVDOoAvzEffNfhwsWQt5C45YZtB197Je7MW	user
4	Kenneth Tan	kenneth@example.com	$2b$12$.juiKHz8xAw7qLsusTKILuqfVKVwGkYBev6tNo95iGyS8laUsiA3m	user
5	Angeline Tan	angeline@example.com	$2b$12$1hlNwcRXk2L0C6nysmLAMeTCTIg7sXb4PB5D83ESIvCqVkLwVEJb2	user
6	Benjamin Tan	benjamin@example.com	$2b$12$JLPIepECtoBU4Ytek.X2beFJUnxzXL8wblMox/.MrW14tVthHVmoK	user
7	Nijel Tan	nijel@example.com	$2b$12$sckOOcvqELkKOdpDmG.RVukTqSjvvqv0bAm2N9W9h.41K2nuYwgSu	user
8	Annie Yap	annie@example.com	$2b$12$5pwqufpA074ScPI9A.CRhOVtkBPd12SY2g2Qz2trFQrWzLb63aYE6	user
9	Lim Chooi Ewe	chooiewe@example.com	$2b$12$yAIeicXlsk72jtLZ1gK26.7lEyFIvah.Zihs8D2wAsD6wqhprNvR2	user
10	Krishnenthiren a/l Chandran	krishna@example.com	$2b$12$bxP7NS6cHBYifgYpmGRl3uQdc.cGlnSKpnZgIQ4A6a6a2dq7uoo0e	user
11	Joelle Soo	joelle@example.com	$2b$12$3v4OF7euozehryrTBMYlxO0crus4j.xq6aEpqRd2edXEAttR4CkTm	user
12	Sharmine Hanna	sharmine@example.com	$2b$12$ZKQR6laUobU3Tb6DYDSPZ.ZHGYqVDYdBsjzWsybXBd98ZppFw/BKG	user
13	Kavin Manalan	kavin@example.com	$2b$12$IdwsA9o01pg9LLiJmkQJye6al9oIPc94.qrFTJWn18yxXM2ZPnVh2	user
14	Hannah Soh	hannah@example.com	$2b$12$3GAibffdwKhM.WGabIPH/eZ8m002Z9.CApqTGbqvHcTFcxJAJP65.	user
15	Megan Lim	megan@example.com	$2b$12$Offg0gQhsQ3zu6hd8nAycOWt3nySR0QQdqINthlEAnl3zPz1j8WO2	user
16	Jenny Lim	jenny@example.com	$2b$12$.rtloUBc3jYUG1okVTfCreTianYx5N8sHjV9YU6g/Qtb1tu76u3Gm	user
17	Victor Soh	victor@example.com	$2b$12$mESlqvsBUQ8l2/ZqrjMkWObf.XnYYiFsS5GS7FmXo3eXn//.bKPg6	user
18	Elizabeth Tan	elizabeth@example.com	$2b$12$eL55GdKTSreaV/rPJywEgu3D6zKgHMRhJj7GG2s5iodPRoM5PFO6K	user
19	Keeron Raj	keeron@example.com	$2b$12$R8MyWIU5wIplUpSXhNpnRuxfFKnDjUAEIL1WBykR97jau6nPZbtEO	user
20	Esther Chew	esther@example.com	$2b$12$isOMpbHyLacpBHO2XhOF7.203HPWiAUYtn2BZxQiT1Z3T5P.7mPgm	user
21	Amanda Lau	amanda@example.com	$2b$12$YRp.SkUHejR5Wga4bmDpeO2AWwwt05WxwY/ZtVY2.SPU/gR.fGphW	user
\.


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comments_id_seq', 17, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 35, true);


--
-- Name: reactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reactions_id_seq', 16, true);


--
-- Name: reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reports_id_seq', 27, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 21, true);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: reactions reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT reactions_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: reactions unique_user_report; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT unique_user_report UNIQUE (user_id, report_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_reports_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_reports_id ON public.reports USING btree (id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: comments comments_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id);


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: reactions reactions_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT reactions_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id);


--
-- Name: reactions reactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: reports reports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict As0de6knUwSr0sbTX1GVAjQnBGx7l9WGYysjTffUUTAWpKPQHtScgehppGGBQyh

