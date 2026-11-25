# Urodzinowa Przygoda — Interaktywna Kartka

Gotowa strona statyczna i projekt źródłowy przygotowane pod **GitHub Pages**.

## Najprostszy sposób uruchomienia (bez żadnego budowania)

Gotowa, zbudowana strona znajduje się w folderze **`docs/`**.

### Opcja 1: Wrzucasz cały folder projektu na GitHuba
1. Rozpakuj pobrany plik `.zip`.
2. Utwórz nowe repozytorium na GitHubie i wrzuć do niego cały rozpakowany folder (możesz użyć *Add file → Upload files* albo `git push`).
3. Na GitHubie otwórz **Settings → Pages**.
4. W sekcji **Build and deployment → Source** wybierz **Deploy from a branch**.
5. Jako **Branch** ustaw `main`, a jako folder wybierz **`/docs`** i kliknij **Save**.
6. Po ok. minucie strona będzie dostępna pod adresem `https://TWOJ_NICK.github.io/NAZWA_REPO/`.

### Opcja 2: Wrzucasz samą zawartość folderu `docs/`
1. Rozpakuj `.zip` i wejdź do folderu **`docs/`**.
2. Wrzuć zawartość folderu `docs/` bezpośrednio do głównego katalogu nowego repozytorium na GitHubie.
3. W **Settings → Pages** wybierz **Deploy from a branch** → **`main`** → **`/ (root)`** i kliknij **Save**.

---

## Jeśli kiedyś zmienisz coś w kodzie źródłowym (`src/`)

Możesz odświeżyć folder `docs/` poleceniem:
```bash
npm install
npx vite build --outDir docs
```
(Alternatywnie w projekcie znajduje się także automatyczny workflow `.github/workflows/deploy.yml` dla trybu **GitHub Actions**.)
# urodzinki
# urodzinki
