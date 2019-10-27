
Development setup
=================

- `git clone` this repository.
- Install [Node.js]. To check if you already have Node.js, run `npm --version`.
- Install [clasp][1] and enable the Google Apps Script API as explained in the
  installation instructions.
- Make a copy of the [test registration form results][2] for testing and
  development. This will also make a hidden copy of the Google Apps Script
  project, which we'll access next.
- View [your projects][3] and pick the new Master Workshop Matcher. This should
  show you a dashboard with statistics on your Google Apps Script project.
- Copy the project ID from the URL. It should look like this:
  `https://script.google.com/home/projects/27f2D1ErmlvpFxNnfyGP4E2E9MMcdEsPtYv4Ws1xFr934jl_o22eR35jl`
  Where `27f2D1ErmlvpFxNnfyGP4E2E9MMcdEsPtYv4Ws1xFr934jl_o22eR35jl` is the
  project ID.
- Create `.clasp.json` in your local clone of the repository. Add a line like
  this, using the project ID from the previous step:
  `{"scriptId":"18e9H9CkBihCahyMUjkb9w7o9MMcdEEPGyf7nN4xFp958vl_m55rE87df"}`
  Save and close the file.
- Run `clasp login` in the project directory. You'll need to continue using a
  browser.
- `clasp push` to make your Apps Script project reflect your local repository.
  A successful push will say "Pushed N files." If you get an error, check that
  you [enabled the Google Apps Script API][1].

Testing and contribution
========================

To test changes:

- `clasp push`
- `clasp run matchGirls` (or another function)
- Check the results of your work; for example, check the "Final Workshop
  Matches" sheet if you made changes to the matching algorithm.
- Once everything works, stage your changes and commit them to a feature
  branch.
- Push your feature branch with `git push --set-upstream origin` followed by the name of your branch.
- Make a [new pull request] for that branch. Mention the issue number that your
  changes will resolve.

[Node.js]: https://nodejs.org/en/download/
[1]: https://github.com/google/clasp#install
[2]: https://docs.google.com/spreadsheets/d/1XxMdbq54kqv8qE32OTr-V9RTcmxdRWDafwCSU26pGFU/edit?usp=sharing
[3]: https://script.google.com/home/my
[new pull request]: https://github.com/WhitmanCSCapstone/ge-scheduling/compare
