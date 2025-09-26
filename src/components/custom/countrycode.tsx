"use client";

import * as React from "react";
import Image from "next/image";
import { Check, ChevronDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Country {
  name: string;
  code: string;
  phone: string;
  flag: string;
}

const countries: Country[] = [
  {
    name: "Andorra",
    code: "AD",
    phone: "+376",
    flag: "https://flagcdn.com/w20/ad.png",
  },
  {
    name: "United Arab Emirates",
    code: "AE",
    phone: "+971",
    flag: "https://flagcdn.com/w20/ae.png",
  },
  {
    name: "Afghanistan",
    code: "AF",
    phone: "+93",
    flag: "https://flagcdn.com/w20/af.png",
  },
  {
    name: "Antigua and Barbuda",
    code: "AG",
    phone: "+1",
    flag: "https://flagcdn.com/w20/ag.png",
  },
  {
    name: "Anguilla",
    code: "AI",
    phone: "+1",
    flag: "https://flagcdn.com/w20/ai.png",
  },
  {
    name: "Albania",
    code: "AL",
    phone: "+355",
    flag: "https://flagcdn.com/w20/al.png",
  },
  {
    name: "Armenia",
    code: "AM",
    phone: "+374",
    flag: "https://flagcdn.com/w20/am.png",
  },
  {
    name: "Angola",
    code: "AO",
    phone: "+244",
    flag: "https://flagcdn.com/w20/ao.png",
  },
  {
    name: "Antarctica",
    code: "AQ",
    phone: "+672",
    flag: "https://flagcdn.com/w20/aq.png",
  },
  {
    name: "Argentina",
    code: "AR",
    phone: "+54",
    flag: "https://flagcdn.com/w20/ar.png",
  },
  {
    name: "American Samoa",
    code: "AS",
    phone: "+1",
    flag: "https://flagcdn.com/w20/as.png",
  },
  {
    name: "Austria",
    code: "AT",
    phone: "+43",
    flag: "https://flagcdn.com/w20/at.png",
  },
  {
    name: "Australia",
    code: "AU",
    phone: "+61",
    flag: "https://flagcdn.com/w20/au.png",
  },
  {
    name: "Aruba",
    code: "AW",
    phone: "+297",
    flag: "https://flagcdn.com/w20/aw.png",
  },
  {
    name: "Alland Islands",
    code: "AX",
    phone: "+358",
    flag: "https://flagcdn.com/w20/ax.png",
  },
  {
    name: "Azerbaijan",
    code: "AZ",
    phone: "+994",
    flag: "https://flagcdn.com/w20/az.png",
  },
  {
    name: "Bosnia and Herzegovina",
    code: "BA",
    phone: "+387",
    flag: "https://flagcdn.com/w20/ba.png",
  },
  {
    name: "Barbados",
    code: "BB",
    phone: "+1",
    flag: "https://flagcdn.com/w20/bb.png",
  },
  {
    name: "Bangladesh",
    code: "BD",
    phone: "+880",
    flag: "https://flagcdn.com/w20/bd.png",
  },
  {
    name: "Belgium",
    code: "BE",
    phone: "+32",
    flag: "https://flagcdn.com/w20/be.png",
  },
  {
    name: "Burkina Faso",
    code: "BF",
    phone: "+226",
    flag: "https://flagcdn.com/w20/bf.png",
  },
  {
    name: "Bulgaria",
    code: "BG",
    phone: "+359",
    flag: "https://flagcdn.com/w20/bg.png",
  },
  {
    name: "Bahrain",
    code: "BH",
    phone: "+973",
    flag: "https://flagcdn.com/w20/bh.png",
  },
  {
    name: "Burundi",
    code: "BI",
    phone: "+257",
    flag: "https://flagcdn.com/w20/bi.png",
  },
  {
    name: "Benin",
    code: "BJ",
    phone: "+229",
    flag: "https://flagcdn.com/w20/bj.png",
  },
  {
    name: "Saint Barthelemy",
    code: "BL",
    phone: "+590",
    flag: "https://flagcdn.com/w20/bl.png",
  },
  {
    name: "Bermuda",
    code: "BM",
    phone: "+1",
    flag: "https://flagcdn.com/w20/bm.png",
  },
  {
    name: "Brunei Darussalam",
    code: "BN",
    phone: "+673",
    flag: "https://flagcdn.com/w20/bn.png",
  },
  {
    name: "Bolivia",
    code: "BO",
    phone: "+591",
    flag: "https://flagcdn.com/w20/bo.png",
  },
  {
    name: "Brazil",
    code: "BR",
    phone: "+55",
    flag: "https://flagcdn.com/w20/br.png",
  },
  {
    name: "Bahamas",
    code: "BS",
    phone: "+1",
    flag: "https://flagcdn.com/w20/bs.png",
  },
  {
    name: "Bhutan",
    code: "BT",
    phone: "+975",
    flag: "https://flagcdn.com/w20/bt.png",
  },
  {
    name: "Bouvet Island",
    code: "BV",
    phone: "+47",
    flag: "https://flagcdn.com/w20/bv.png",
  },
  {
    name: "Botswana",
    code: "BW",
    phone: "+267",
    flag: "https://flagcdn.com/w20/bw.png",
  },
  {
    name: "Belarus",
    code: "BY",
    phone: "+375",
    flag: "https://flagcdn.com/w20/by.png",
  },
  {
    name: "Belize",
    code: "BZ",
    phone: "+501",
    flag: "https://flagcdn.com/w20/bz.png",
  },
  {
    name: "Canada",
    code: "CA",
    phone: "+1",
    flag: "https://flagcdn.com/w20/ca.png",
  },
  {
    name: "Cocos (Keeling) Islands",
    code: "CC",
    phone: "+61",
    flag: "https://flagcdn.com/w20/cc.png",
  },
  {
    name: "Congo, Democratic Republic of the",
    code: "CD",
    phone: "+243",
    flag: "https://flagcdn.com/w20/cd.png",
  },
  {
    name: "Central African Republic",
    code: "CF",
    phone: "+236",
    flag: "https://flagcdn.com/w20/cf.png",
  },
  {
    name: "Congo, Republic of the",
    code: "CG",
    phone: "+242",
    flag: "https://flagcdn.com/w20/cg.png",
  },
  {
    name: "Switzerland",
    code: "CH",
    phone: "+41",
    flag: "https://flagcdn.com/w20/ch.png",
  },
  {
    name: "Cote d'Ivoire",
    code: "CI",
    phone: "+225",
    flag: "https://flagcdn.com/w20/ci.png",
  },
  {
    name: "Cook Islands",
    code: "CK",
    phone: "+682",
    flag: "https://flagcdn.com/w20/ck.png",
  },
  {
    name: "Chile",
    code: "CL",
    phone: "+56",
    flag: "https://flagcdn.com/w20/cl.png",
  },
  {
    name: "Cameroon",
    code: "CM",
    phone: "+237",
    flag: "https://flagcdn.com/w20/cm.png",
  },
  {
    name: "China",
    code: "CN",
    phone: "+86",
    flag: "https://flagcdn.com/w20/cn.png",
  },
  {
    name: "Colombia",
    code: "CO",
    phone: "+57",
    flag: "https://flagcdn.com/w20/co.png",
  },
  {
    name: "Costa Rica",
    code: "CR",
    phone: "+506",
    flag: "https://flagcdn.com/w20/cr.png",
  },
  {
    name: "Cuba",
    code: "CU",
    phone: "+53",
    flag: "https://flagcdn.com/w20/cu.png",
  },
  {
    name: "Cape Verde",
    code: "CV",
    phone: "+238",
    flag: "https://flagcdn.com/w20/cv.png",
  },
  {
    name: "Curacao",
    code: "CW",
    phone: "+599",
    flag: "https://flagcdn.com/w20/cw.png",
  },
  {
    name: "Christmas Island",
    code: "CX",
    phone: "+61",
    flag: "https://flagcdn.com/w20/cx.png",
  },
  {
    name: "Cyprus",
    code: "CY",
    phone: "+357",
    flag: "https://flagcdn.com/w20/cy.png",
  },
  {
    name: "Czech Republic",
    code: "CZ",
    phone: "+420",
    flag: "https://flagcdn.com/w20/cz.png",
  },
  {
    name: "Germany",
    code: "DE",
    phone: "+49",
    flag: "https://flagcdn.com/w20/de.png",
  },
  {
    name: "Djibouti",
    code: "DJ",
    phone: "+253",
    flag: "https://flagcdn.com/w20/dj.png",
  },
  {
    name: "Denmark",
    code: "DK",
    phone: "+45",
    flag: "https://flagcdn.com/w20/dk.png",
  },
  {
    name: "Dominica",
    code: "DM",
    phone: "+1",
    flag: "https://flagcdn.com/w20/dm.png",
  },
  {
    name: "Dominican Republic",
    code: "DO",
    phone: "+1",
    flag: "https://flagcdn.com/w20/do.png",
  },
  {
    name: "Algeria",
    code: "DZ",
    phone: "+213",
    flag: "https://flagcdn.com/w20/dz.png",
  },
  {
    name: "Ecuador",
    code: "EC",
    phone: "+593",
    flag: "https://flagcdn.com/w20/ec.png",
  },
  {
    name: "Estonia",
    code: "EE",
    phone: "+372",
    flag: "https://flagcdn.com/w20/ee.png",
  },
  {
    name: "Egypt",
    code: "EG",
    phone: "+20",
    flag: "https://flagcdn.com/w20/eg.png",
  },
  {
    name: "Western Sahara",
    code: "EH",
    phone: "+212",
    flag: "https://flagcdn.com/w20/eh.png",
  },
  {
    name: "Eritrea",
    code: "ER",
    phone: "+291",
    flag: "https://flagcdn.com/w20/er.png",
  },
  {
    name: "Spain",
    code: "ES",
    phone: "+34",
    flag: "https://flagcdn.com/w20/es.png",
  },
  {
    name: "Ethiopia",
    code: "ET",
    phone: "+251",
    flag: "https://flagcdn.com/w20/et.png",
  },
  {
    name: "Finland",
    code: "FI",
    phone: "+358",
    flag: "https://flagcdn.com/w20/fi.png",
  },
  {
    name: "Fiji",
    code: "FJ",
    phone: "+679",
    flag: "https://flagcdn.com/w20/fj.png",
  },
  {
    name: "Falkland Islands (Malvinas)",
    code: "FK",
    phone: "+500",
    flag: "https://flagcdn.com/w20/fk.png",
  },
  {
    name: "Micronesia, Federated States of",
    code: "FM",
    phone: "+691",
    flag: "https://flagcdn.com/w20/fm.png",
  },
  {
    name: "Faroe Islands",
    code: "FO",
    phone: "+298",
    flag: "https://flagcdn.com/w20/fo.png",
  },
  {
    name: "France",
    code: "FR",
    phone: "+33",
    flag: "https://flagcdn.com/w20/fr.png",
  },
  {
    name: "Gabon",
    code: "GA",
    phone: "+241",
    flag: "https://flagcdn.com/w20/ga.png",
  },
  {
    name: "United Kingdom",
    code: "GB",
    phone: "+44",
    flag: "https://flagcdn.com/w20/gb.png",
  },
  {
    name: "Grenada",
    code: "GD",
    phone: "+1",
    flag: "https://flagcdn.com/w20/gd.png",
  },
  {
    name: "Georgia",
    code: "GE",
    phone: "+995",
    flag: "https://flagcdn.com/w20/ge.png",
  },
  {
    name: "French Guiana",
    code: "GF",
    phone: "+594",
    flag: "https://flagcdn.com/w20/gf.png",
  },
  {
    name: "Guernsey",
    code: "GG",
    phone: "+44",
    flag: "https://flagcdn.com/w20/gg.png",
  },
  {
    name: "Ghana",
    code: "GH",
    phone: "+233",
    flag: "https://flagcdn.com/w20/gh.png",
  },
  {
    name: "Gibraltar",
    code: "GI",
    phone: "+350",
    flag: "https://flagcdn.com/w20/gi.png",
  },
  {
    name: "Greenland",
    code: "GL",
    phone: "+299",
    flag: "https://flagcdn.com/w20/gl.png",
  },
  {
    name: "Gambia",
    code: "GM",
    phone: "+220",
    flag: "https://flagcdn.com/w20/gm.png",
  },
  {
    name: "Guinea",
    code: "GN",
    phone: "+224",
    flag: "https://flagcdn.com/w20/gn.png",
  },
  {
    name: "Guadeloupe",
    code: "GP",
    phone: "+590",
    flag: "https://flagcdn.com/w20/gp.png",
  },
  {
    name: "Equatorial Guinea",
    code: "GQ",
    phone: "+240",
    flag: "https://flagcdn.com/w20/gq.png",
  },
  {
    name: "Greece",
    code: "GR",
    phone: "+30",
    flag: "https://flagcdn.com/w20/gr.png",
  },
  {
    name: "South Georgia and the South Sandwich Islands",
    code: "GS",
    phone: "+500",
    flag: "https://flagcdn.com/w20/gs.png",
  },
  {
    name: "Guatemala",
    code: "GT",
    phone: "+502",
    flag: "https://flagcdn.com/w20/gt.png",
  },
  {
    name: "Guam",
    code: "GU",
    phone: "+1",
    flag: "https://flagcdn.com/w20/gu.png",
  },
  {
    name: "Guinea-Bissau",
    code: "GW",
    phone: "+245",
    flag: "https://flagcdn.com/w20/gw.png",
  },
  {
    name: "Guyana",
    code: "GY",
    phone: "+592",
    flag: "https://flagcdn.com/w20/gy.png",
  },
  {
    name: "Hong Kong",
    code: "HK",
    phone: "+852",
    flag: "https://flagcdn.com/w20/hk.png",
  },
  {
    name: "Heard Island and McDonald Islands",
    code: "HM",
    phone: "+672",
    flag: "https://flagcdn.com/w20/hm.png",
  },
  {
    name: "Honduras",
    code: "HN",
    phone: "+504",
    flag: "https://flagcdn.com/w20/hn.png",
  },
  {
    name: "Croatia",
    code: "HR",
    phone: "+385",
    flag: "https://flagcdn.com/w20/hr.png",
  },
  {
    name: "Haiti",
    code: "HT",
    phone: "+509",
    flag: "https://flagcdn.com/w20/ht.png",
  },
  {
    name: "Hungary",
    code: "HU",
    phone: "+36",
    flag: "https://flagcdn.com/w20/hu.png",
  },
  {
    name: "Indonesia",
    code: "ID",
    phone: "+62",
    flag: "https://flagcdn.com/w20/id.png",
  },
  {
    name: "Ireland",
    code: "IE",
    phone: "+353",
    flag: "https://flagcdn.com/w20/ie.png",
  },
  {
    name: "Israel",
    code: "IL",
    phone: "+972",
    flag: "https://flagcdn.com/w20/il.png",
  },
  {
    name: "Isle of Man",
    code: "IM",
    phone: "+44",
    flag: "https://flagcdn.com/w20/im.png",
  },
  {
    name: "India",
    code: "IN",
    phone: "+91",
    flag: "https://flagcdn.com/w20/in.png",
  },
  {
    name: "British Indian Ocean Territory",
    code: "IO",
    phone: "+246",
    flag: "https://flagcdn.com/w20/io.png",
  },
  {
    name: "Iraq",
    code: "IQ",
    phone: "+964",
    flag: "https://flagcdn.com/w20/iq.png",
  },
  {
    name: "Iran, Islamic Republic of",
    code: "IR",
    phone: "+98",
    flag: "https://flagcdn.com/w20/ir.png",
  },
  {
    name: "Iceland",
    code: "IS",
    phone: "+354",
    flag: "https://flagcdn.com/w20/is.png",
  },
  {
    name: "Italy",
    code: "IT",
    phone: "+39",
    flag: "https://flagcdn.com/w20/it.png",
  },
  {
    name: "Jersey",
    code: "JE",
    phone: "+44",
    flag: "https://flagcdn.com/w20/je.png",
  },
  {
    name: "Jamaica",
    code: "JM",
    phone: "+1",
    flag: "https://flagcdn.com/w20/jm.png",
  },
  {
    name: "Jordan",
    code: "JO",
    phone: "+962",
    flag: "https://flagcdn.com/w20/jo.png",
  },
  {
    name: "Japan",
    code: "JP",
    phone: "+81",
    flag: "https://flagcdn.com/w20/jp.png",
  },
  {
    name: "Kenya",
    code: "KE",
    phone: "+254",
    flag: "https://flagcdn.com/w20/ke.png",
  },
  {
    name: "Kyrgyzstan",
    code: "KG",
    phone: "+996",
    flag: "https://flagcdn.com/w20/kg.png",
  },
  {
    name: "Cambodia",
    code: "KH",
    phone: "+855",
    flag: "https://flagcdn.com/w20/kh.png",
  },
  {
    name: "Kiribati",
    code: "KI",
    phone: "+686",
    flag: "https://flagcdn.com/w20/ki.png",
  },
  {
    name: "Comoros",
    code: "KM",
    phone: "+269",
    flag: "https://flagcdn.com/w20/km.png",
  },
  {
    name: "Saint Kitts and Nevis",
    code: "KN",
    phone: "+1",
    flag: "https://flagcdn.com/w20/kn.png",
  },
  {
    name: "Korea, Democratic People's Republic of",
    code: "KP",
    phone: "+850",
    flag: "https://flagcdn.com/w20/kp.png",
  },
  {
    name: "Korea, Republic of",
    code: "KR",
    phone: "+82",
    flag: "https://flagcdn.com/w20/kr.png",
  },
  {
    name: "Kuwait",
    code: "KW",
    phone: "+965",
    flag: "https://flagcdn.com/w20/kw.png",
  },
  {
    name: "Cayman Islands",
    code: "KY",
    phone: "+1",
    flag: "https://flagcdn.com/w20/ky.png",
  },
  {
    name: "Kazakhstan",
    code: "KZ",
    phone: "+7",
    flag: "https://flagcdn.com/w20/kz.png",
  },
  {
    name: "Lao People's Democratic Republic",
    code: "LA",
    phone: "+856",
    flag: "https://flagcdn.com/w20/la.png",
  },
  {
    name: "Lebanon",
    code: "LB",
    phone: "+961",
    flag: "https://flagcdn.com/w20/lb.png",
  },
  {
    name: "Saint Lucia",
    code: "LC",
    phone: "+1",
    flag: "https://flagcdn.com/w20/lc.png",
  },
  {
    name: "Liechtenstein",
    code: "LI",
    phone: "+423",
    flag: "https://flagcdn.com/w20/li.png",
  },
  {
    name: "Sri Lanka",
    code: "LK",
    phone: "+94",
    flag: "https://flagcdn.com/w20/lk.png",
  },
  {
    name: "Liberia",
    code: "LR",
    phone: "+231",
    flag: "https://flagcdn.com/w20/lr.png",
  },
  {
    name: "Lesotho",
    code: "LS",
    phone: "+266",
    flag: "https://flagcdn.com/w20/ls.png",
  },
  {
    name: "Lithuania",
    code: "LT",
    phone: "+370",
    flag: "https://flagcdn.com/w20/lt.png",
  },
  {
    name: "Luxembourg",
    code: "LU",
    phone: "+352",
    flag: "https://flagcdn.com/w20/lu.png",
  },
  {
    name: "Latvia",
    code: "LV",
    phone: "+371",
    flag: "https://flagcdn.com/w20/lv.png",
  },
  {
    name: "Libya",
    code: "LY",
    phone: "+218",
    flag: "https://flagcdn.com/w20/ly.png",
  },
  {
    name: "Morocco",
    code: "MA",
    phone: "+212",
    flag: "https://flagcdn.com/w20/ma.png",
  },
  {
    name: "Monaco",
    code: "MC",
    phone: "+377",
    flag: "https://flagcdn.com/w20/mc.png",
  },
  {
    name: "Moldova, Republic of",
    code: "MD",
    phone: "+373",
    flag: "https://flagcdn.com/w20/md.png",
  },
  {
    name: "Montenegro",
    code: "ME",
    phone: "+382",
    flag: "https://flagcdn.com/w20/me.png",
  },
  {
    name: "Saint Martin (French part)",
    code: "MF",
    phone: "+590",
    flag: "https://flagcdn.com/w20/mf.png",
  },
  {
    name: "Madagascar",
    code: "MG",
    phone: "+261",
    flag: "https://flagcdn.com/w20/mg.png",
  },
  {
    name: "Marshall Islands",
    code: "MH",
    phone: "+692",
    flag: "https://flagcdn.com/w20/mh.png",
  },
  {
    name: "Macedonia, the Former Yugoslav Republic of",
    code: "MK",
    phone: "+389",
    flag: "https://flagcdn.com/w20/mk.png",
  },
  {
    name: "Mali",
    code: "ML",
    phone: "+223",
    flag: "https://flagcdn.com/w20/ml.png",
  },
  {
    name: "Myanmar",
    code: "MM",
    phone: "+95",
    flag: "https://flagcdn.com/w20/mm.png",
  },
  {
    name: "Mongolia",
    code: "MN",
    phone: "+976",
    flag: "https://flagcdn.com/w20/mn.png",
  },
  {
    name: "Macao",
    code: "MO",
    phone: "+853",
    flag: "https://flagcdn.com/w20/mo.png",
  },
  {
    name: "Northern Mariana Islands",
    code: "MP",
    phone: "+1",
    flag: "https://flagcdn.com/w20/mp.png",
  },
  {
    name: "Martinique",
    code: "MQ",
    phone: "+596",
    flag: "https://flagcdn.com/w20/mq.png",
  },
  {
    name: "Mauritania",
    code: "MR",
    phone: "+222",
    flag: "https://flagcdn.com/w20/mr.png",
  },
  {
    name: "Montserrat",
    code: "MS",
    phone: "+1",
    flag: "https://flagcdn.com/w20/ms.png",
  },
  {
    name: "Malta",
    code: "MT",
    phone: "+356",
    flag: "https://flagcdn.com/w20/mt.png",
  },
  {
    name: "Mauritius",
    code: "MU",
    phone: "+230",
    flag: "https://flagcdn.com/w20/mu.png",
  },
  {
    name: "Maldives",
    code: "MV",
    phone: "+960",
    flag: "https://flagcdn.com/w20/mv.png",
  },
  {
    name: "Malawi",
    code: "MW",
    phone: "+265",
    flag: "https://flagcdn.com/w20/mw.png",
  },
  {
    name: "Mexico",
    code: "MX",
    phone: "+52",
    flag: "https://flagcdn.com/w20/mx.png",
  },
  {
    name: "Malaysia",
    code: "MY",
    phone: "+60",
    flag: "https://flagcdn.com/w20/my.png",
  },
  {
    name: "Mozambique",
    code: "MZ",
    phone: "+258",
    flag: "https://flagcdn.com/w20/mz.png",
  },
  {
    name: "Namibia",
    code: "NA",
    phone: "+264",
    flag: "https://flagcdn.com/w20/na.png",
  },
  {
    name: "New Caledonia",
    code: "NC",
    phone: "+687",
    flag: "https://flagcdn.com/w20/nc.png",
  },
  {
    name: "Niger",
    code: "NE",
    phone: "+227",
    flag: "https://flagcdn.com/w20/ne.png",
  },
  {
    name: "Norfolk Island",
    code: "NF",
    phone: "+672",
    flag: "https://flagcdn.com/w20/nf.png",
  },
  {
    name: "Nigeria",
    code: "NG",
    phone: "+234",
    flag: "https://flagcdn.com/w20/ng.png",
  },
  {
    name: "Nicaragua",
    code: "NI",
    phone: "+505",
    flag: "https://flagcdn.com/w20/ni.png",
  },
  {
    name: "Netherlands",
    code: "NL",
    phone: "+31",
    flag: "https://flagcdn.com/w20/nl.png",
  },
  {
    name: "Norway",
    code: "NO",
    phone: "+47",
    flag: "https://flagcdn.com/w20/no.png",
  },
  {
    name: "Nepal",
    code: "NP",
    phone: "+977",
    flag: "https://flagcdn.com/w20/np.png",
  },
  {
    name: "Nauru",
    code: "NR",
    phone: "+674",
    flag: "https://flagcdn.com/w20/nr.png",
  },
  {
    name: "Niue",
    code: "NU",
    phone: "+683",
    flag: "https://flagcdn.com/w20/nu.png",
  },
  {
    name: "New Zealand",
    code: "NZ",
    phone: "+64",
    flag: "https://flagcdn.com/w20/nz.png",
  },
  {
    name: "Oman",
    code: "OM",
    phone: "+968",
    flag: "https://flagcdn.com/w20/om.png",
  },
  {
    name: "Panama",
    code: "PA",
    phone: "+507",
    flag: "https://flagcdn.com/w20/pa.png",
  },
  {
    name: "Peru",
    code: "PE",
    phone: "+51",
    flag: "https://flagcdn.com/w20/pe.png",
  },
  {
    name: "French Polynesia",
    code: "PF",
    phone: "+689",
    flag: "https://flagcdn.com/w20/pf.png",
  },
  {
    name: "Papua New Guinea",
    code: "PG",
    phone: "+675",
    flag: "https://flagcdn.com/w20/pg.png",
  },
  {
    name: "Philippines",
    code: "PH",
    phone: "+63",
    flag: "https://flagcdn.com/w20/ph.png",
  },
  {
    name: "Pakistan",
    code: "PK",
    phone: "+92",
    flag: "https://flagcdn.com/w20/pk.png",
  },
  {
    name: "Poland",
    code: "PL",
    phone: "+48",
    flag: "https://flagcdn.com/w20/pl.png",
  },
  {
    name: "Saint Pierre and Miquelon",
    code: "PM",
    phone: "+508",
    flag: "https://flagcdn.com/w20/pm.png",
  },
  {
    name: "Pitcairn",
    code: "PN",
    phone: "+870",
    flag: "https://flagcdn.com/w20/pn.png",
  },
  {
    name: "Puerto Rico",
    code: "PR",
    phone: "+1",
    flag: "https://flagcdn.com/w20/pr.png",
  },
  {
    name: "Palestine, State of",
    code: "PS",
    phone: "+970",
    flag: "https://flagcdn.com/w20/ps.png",
  },
  {
    name: "Portugal",
    code: "PT",
    phone: "+351",
    flag: "https://flagcdn.com/w20/pt.png",
  },
  {
    name: "Palau",
    code: "PW",
    phone: "+680",
    flag: "https://flagcdn.com/w20/pw.png",
  },
  {
    name: "Paraguay",
    code: "PY",
    phone: "+595",
    flag: "https://flagcdn.com/w20/py.png",
  },
  {
    name: "Qatar",
    code: "QA",
    phone: "+974",
    flag: "https://flagcdn.com/w20/qa.png",
  },
  {
    name: "Reunion",
    code: "RE",
    phone: "+262",
    flag: "https://flagcdn.com/w20/re.png",
  },
  {
    name: "Romania",
    code: "RO",
    phone: "+40",
    flag: "https://flagcdn.com/w20/ro.png",
  },
  {
    name: "Serbia",
    code: "RS",
    phone: "+381",
    flag: "https://flagcdn.com/w20/rs.png",
  },
  {
    name: "Russian Federation",
    code: "RU",
    phone: "+7",
    flag: "https://flagcdn.com/w20/ru.png",
  },
  {
    name: "Rwanda",
    code: "RW",
    phone: "+250",
    flag: "https://flagcdn.com/w20/rw.png",
  },
  {
    name: "Saudi Arabia",
    code: "SA",
    phone: "+966",
    flag: "https://flagcdn.com/w20/sa.png",
  },
  {
    name: "Solomon Islands",
    code: "SB",
    phone: "+677",
    flag: "https://flagcdn.com/w20/sb.png",
  },
  {
    name: "Seychelles",
    code: "SC",
    phone: "+248",
    flag: "https://flagcdn.com/w20/sc.png",
  },
  {
    name: "Sudan",
    code: "SD",
    phone: "+249",
    flag: "https://flagcdn.com/w20/sd.png",
  },
  {
    name: "Sweden",
    code: "SE",
    phone: "+46",
    flag: "https://flagcdn.com/w20/se.png",
  },
  {
    name: "Singapore",
    code: "SG",
    phone: "+65",
    flag: "https://flagcdn.com/w20/sg.png",
  },
  {
    name: "Saint Helena",
    code: "SH",
    phone: "+290",
    flag: "https://flagcdn.com/w20/sh.png",
  },
  {
    name: "Slovenia",
    code: "SI",
    phone: "+386",
    flag: "https://flagcdn.com/w20/si.png",
  },
  {
    name: "Svalbard and Jan Mayen",
    code: "SJ",
    phone: "+47",
    flag: "https://flagcdn.com/w20/sj.png",
  },
  {
    name: "Slovakia",
    code: "SK",
    phone: "+421",
    flag: "https://flagcdn.com/w20/sk.png",
  },
  {
    name: "Sierra Leone",
    code: "SL",
    phone: "+232",
    flag: "https://flagcdn.com/w20/sl.png",
  },
  {
    name: "San Marino",
    code: "SM",
    phone: "+378",
    flag: "https://flagcdn.com/w20/sm.png",
  },
  {
    name: "Senegal",
    code: "SN",
    phone: "+221",
    flag: "https://flagcdn.com/w20/sn.png",
  },
  {
    name: "Somalia",
    code: "SO",
    phone: "+252",
    flag: "https://flagcdn.com/w20/so.png",
  },
  {
    name: "Suriname",
    code: "SR",
    phone: "+597",
    flag: "https://flagcdn.com/w20/sr.png",
  },
  {
    name: "South Sudan",
    code: "SS",
    phone: "+211",
    flag: "https://flagcdn.com/w20/ss.png",
  },
  {
    name: "Sao Tome and Principe",
    code: "ST",
    phone: "+239",
    flag: "https://flagcdn.com/w20/st.png",
  },
  {
    name: "El Salvador",
    code: "SV",
    phone: "+503",
    flag: "https://flagcdn.com/w20/sv.png",
  },
  {
    name: "Sint Maarten (Dutch part)",
    code: "SX",
    phone: "+1",
    flag: "https://flagcdn.com/w20/sx.png",
  },
  {
    name: "Syrian Arab Republic",
    code: "SY",
    phone: "+963",
    flag: "https://flagcdn.com/w20/sy.png",
  },
  {
    name: "Swaziland",
    code: "SZ",
    phone: "+268",
    flag: "https://flagcdn.com/w20/sz.png",
  },
  {
    name: "Turks and Caicos Islands",
    code: "TC",
    phone: "+1",
    flag: "https://flagcdn.com/w20/tc.png",
  },
  {
    name: "Chad",
    code: "TD",
    phone: "+235",
    flag: "https://flagcdn.com/w20/td.png",
  },
  {
    name: "French Southern Territories",
    code: "TF",
    phone: "+262",
    flag: "https://flagcdn.com/w20/tf.png",
  },
  {
    name: "Togo",
    code: "TG",
    phone: "+228",
    flag: "https://flagcdn.com/w20/tg.png",
  },
  {
    name: "Thailand",
    code: "TH",
    phone: "+66",
    flag: "https://flagcdn.com/w20/th.png",
  },
  {
    name: "Tajikistan",
    code: "TJ",
    phone: "+992",
    flag: "https://flagcdn.com/w20/tj.png",
  },
  {
    name: "Tokelau",
    code: "TK",
    phone: "+690",
    flag: "https://flagcdn.com/w20/tk.png",
  },
  {
    name: "Timor-Leste",
    code: "TL",
    phone: "+670",
    flag: "https://flagcdn.com/w20/tl.png",
  },
  {
    name: "Turkmenistan",
    code: "TM",
    phone: "+993",
    flag: "https://flagcdn.com/w20/tm.png",
  },
  {
    name: "Tunisia",
    code: "TN",
    phone: "+216",
    flag: "https://flagcdn.com/w20/tn.png",
  },
  {
    name: "Tonga",
    code: "TO",
    phone: "+676",
    flag: "https://flagcdn.com/w20/to.png",
  },
  {
    name: "Turkey",
    code: "TR",
    phone: "+90",
    flag: "https://flagcdn.com/w20/tr.png",
  },
  {
    name: "Trinidad and Tobago",
    code: "TT",
    phone: "+1",
    flag: "https://flagcdn.com/w20/tt.png",
  },
  {
    name: "Tuvalu",
    code: "TV",
    phone: "+688",
    flag: "https://flagcdn.com/w20/tv.png",
  },
  {
    name: "Taiwan, Province of China",
    code: "TW",
    phone: "+886",
    flag: "https://flagcdn.com/w20/tw.png",
  },
  {
    name: "United Republic of Tanzania",
    code: "TZ",
    phone: "+255",
    flag: "https://flagcdn.com/w20/tz.png",
  },
  {
    name: "Ukraine",
    code: "UA",
    phone: "+380",
    flag: "https://flagcdn.com/w20/ua.png",
  },
  {
    name: "Uganda",
    code: "UG",
    phone: "+256",
    flag: "https://flagcdn.com/w20/ug.png",
  },
  {
    name: "United States",
    code: "US",
    phone: "+1",
    flag: "https://flagcdn.com/w20/us.png",
  },
  {
    name: "Uruguay",
    code: "UY",
    phone: "+598",
    flag: "https://flagcdn.com/w20/uy.png",
  },
  {
    name: "Uzbekistan",
    code: "UZ",
    phone: "+998",
    flag: "https://flagcdn.com/w20/uz.png",
  },
  {
    name: "Holy See (Vatican City State)",
    code: "VA",
    phone: "+39",
    flag: "https://flagcdn.com/w20/va.png",
  },
  {
    name: "Saint Vincent and the Grenadines",
    code: "VC",
    phone: "+1",
    flag: "https://flagcdn.com/w20/vc.png",
  },
  {
    name: "Venezuela",
    code: "VE",
    phone: "+58",
    flag: "https://flagcdn.com/w20/ve.png",
  },
  {
    name: "British Virgin Islands",
    code: "VG",
    phone: "+1",
    flag: "https://flagcdn.com/w20/vg.png",
  },
  {
    name: "US Virgin Islands",
    code: "VI",
    phone: "+1",
    flag: "https://flagcdn.com/w20/vi.png",
  },
  {
    name: "Vietnam",
    code: "VN",
    phone: "+84",
    flag: "https://flagcdn.com/w20/vn.png",
  },
  {
    name: "Vanuatu",
    code: "VU",
    phone: "+678",
    flag: "https://flagcdn.com/w20/vu.png",
  },
  {
    name: "Wallis and Futuna",
    code: "WF",
    phone: "+681",
    flag: "https://flagcdn.com/w20/wf.png",
  },
  {
    name: "Samoa",
    code: "WS",
    phone: "+685",
    flag: "https://flagcdn.com/w20/ws.png",
  },
  {
    name: "Kosovo",
    code: "XK",
    phone: "+383",
    flag: "https://flagcdn.com/w20/xk.png",
  },
  {
    name: "Yemen",
    code: "YE",
    phone: "+967",
    flag: "https://flagcdn.com/w20/ye.png",
  },
  {
    name: "Mayotte",
    code: "YT",
    phone: "+262",
    flag: "https://flagcdn.com/w20/yt.png",
  },
  {
    name: "South Africa",
    code: "ZA",
    phone: "+27",
    flag: "https://flagcdn.com/w20/za.png",
  },
  {
    name: "Zambia",
    code: "ZM",
    phone: "+260",
    flag: "https://flagcdn.com/w20/zm.png",
  },
  {
    name: "Zimbabwe",
    code: "ZW",
    phone: "+263",
    flag: "https://flagcdn.com/w20/zw.png",
  },
];

interface CountryCodeSelectorProps {
  value: Country | undefined;
  onChange?: (country: Country | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CountryCodeSelector({
  value,
  onChange,
  placeholder = "Filter Country",
  className,
  disabled = false,
}: CountryCodeSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            className
          )}
        >
          {value ? (
            <div className="flex items-center gap-2">
              <Image
                loading="lazy"
                width={20}
                height={15}
                src={value.flag}
                alt={`Flag of ${value.name}`}
              />
              <span>
                {value.name} ({value.code}) {value.phone}
              </span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={search}
            onValueChange={setSearch}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map(country => (
                <CommandItem
                  key={country.code}
                  value={`${country.name} ${country.code} ${country.phone}`}
                  onSelect={() => {
                    onChange?.(country);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value?.code === country.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <Image
                    loading="lazy"
                    width={20}
                    height={15}
                    src={country.flag}
                    alt={`Flag of ${country.name}`}
                    className="mr-2"
                  />
                  <span>
                    {country.name} ({country.code}) {country.phone}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { countries };
