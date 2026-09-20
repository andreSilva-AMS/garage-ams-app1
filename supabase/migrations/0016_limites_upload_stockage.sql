-- =============================================================================
-- ReceptCar — Limites de taille et de type de fichier sur les buckets
--
-- Trouvé lors du contrôle de sécurité du 20.09 : les buckets "receptions" et
-- "garage-logos" n'avaient aucune limite de taille ni de type MIME. N'importe
-- quel compte authentifié pouvait donc uploader un fichier arbitrairement
-- volumineux (coût de stockage, déni de service) ou d'un type non prévu.
-- "garage-logos" est un bucket PUBLIC (URL accessible sans authentification) :
-- y autoriser un SVG est particulièrement risqué (un SVG peut contenir du
-- JavaScript, exécuté si l'URL brute est ouverte directement dans un
-- navigateur) — on restreint donc aux formats matriciels utilisés par
-- l'application.
-- =============================================================================

update storage.buckets
set file_size_limit = 10 * 1024 * 1024, -- 10 Mo (photos compressées + PDF assemblé)
    allowed_mime_types = array['image/jpeg', 'application/pdf']
where id = 'receptions';

update storage.buckets
set file_size_limit = 3 * 1024 * 1024, -- 3 Mo
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'garage-logos';

NOTIFY pgrst, 'reload schema';
