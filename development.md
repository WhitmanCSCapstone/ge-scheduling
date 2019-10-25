
Development setup
=================

- `git clone` this repository.
- Install [Node.js]. To check if you already have Node.js, run `npm --version`.
- Install [clasp] and enable the Google Apps Script API as explained in the
  installation instructions.
- Make a copy of the [test registration form results][1] for testing and
  development. This will also make a hidden copy of the Google Apps
  Script project.
- View [your projects][2] and pick the new Master Workshop Matcher.
- Copy the project ID from the URL. It should look like this:
  `https://script.google.com/home/projects/27f2D1ErmlvpFxNnfyGP4E2E9MMcdEsPtYv4Ws1xFr934jl_o22eR35jl`
  Where `27f2D1ErmlvpFxNnfyGP4E2E9MMcdEsPtYv4Ws1xFr934jl_o22eR35jl` is the
  project ID.
- Create `.clasp.json` in your local clone of the repository. Add a line like
  this, using the project ID from the previous step:
  `{"scriptId":"18e9H9CkBihCahyMUjkb9w7o9MMcdEEPGyf7nN4xFp958vl_m55rE87df"}`
  Save and close the file.
- `clasp push` to make your Apps Script project reflect your local repository.
  A successful push will say "Pushed N files."

Testing and contribution
========================

To test changes:

- `clasp push`
- `clasp run matchGirls` (or another function)
- Check the results of your work; for example, check the "Final Workshop
  Matches" sheet if you made changes to the matching algorithm.
- Once everything works, stage your changes and commit them to a feature
  branch.
- Push your feature branch with `git push --set-upstream origin
  $(git_current_branch)` and make a new pull request for that branch.

[Node.js]: https://nodejs.org/en/download/
[clasp]: https://github.com/google/clasp#install
[1]: https://docs.google.com/spreadsheets/d/1XxMdbq54kqv8qE32OTr-V9RTcmxdRWDafwCSU26pGFU/edit?usp=sharing
[2]: https://script.google.com/home/my
