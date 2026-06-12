/* =====================================================================
   SQL PŘÍKAZY nad CSV souborem (feedback.csv)
   ---------------------------------------------------------------------
   CSV se načte do tabulky `feedback` a pak se nad ní spouští normální
   SQL (přes knihovnu alasql) — úplně stejně, jako by to byla SQL databáze.
   Každý dotaz pohání jeden graf / kartu na stránce.
   ===================================================================== */

const SQL = {

  // --- KPI karty (jedno číslo) ---------------------------------------
  celkem:       `SELECT COUNT(*)                  AS hodnota FROM feedback`,
  prumer:       `SELECT ROUND(AVG(rating), 2)     AS hodnota FROM feedback`,
  spokojenost:  `SELECT ROUND(AVG(rating)/5*100, 0) AS hodnota FROM feedback`,
  chteji_kontakt: `SELECT COUNT(*)                AS hodnota FROM feedback WHERE wantsContact = 1`,
  za_7_dni:     `SELECT COUNT(*)                  AS hodnota FROM feedback WHERE datum >= ?`,
  za_30_dni:    `SELECT COUNT(*)                  AS hodnota FROM feedback WHERE datum >= ?`,

  // --- Graf: počet feedbacků po dnech (čárový) -----------------------
  // řadíme podle aliasu `den` — alasql po GROUP BY neřadí spolehlivě podle
  // původního názvu sloupce
  po_dnech:     `SELECT datum AS den, COUNT(*) AS pocet
                 FROM feedback GROUP BY datum ORDER BY den`,

  // --- Graf: rozložení hodnocení 1–5 (sloupcový) ---------------------
  rozlozeni_hodnoceni: `SELECT rating AS hvezdicky, COUNT(*) AS pocet
                        FROM feedback GROUP BY rating ORDER BY rating`,

  // --- Graf: počet podle kategorie (sloupcový) -----------------------
  podle_kategorie: `SELECT categoryName AS kategorie, COUNT(*) AS pocet
                    FROM feedback GROUP BY categoryName ORDER BY pocet DESC`,

  // --- Graf: průměrné hodnocení podle kategorie (sloupcový) -----------
  prumer_kategorie: `SELECT categoryName AS kategorie, ROUND(AVG(rating), 2) AS prumer
                     FROM feedback GROUP BY categoryName ORDER BY prumer DESC`,

  // --- Graf: vyřešeno vs. nevyřešeno (koláč) --------------------------
  stav: `SELECT resolved AS vyreseno, COUNT(*) AS pocet
         FROM feedback GROUP BY resolved`,

  // --- Graf: aktivita podle dne v týdnu (sloupcový) ------------------
  dny_v_tydnu: `SELECT dow, den_v_tydnu, COUNT(*) AS pocet
                FROM feedback GROUP BY dow, den_v_tydnu ORDER BY dow`,
};
