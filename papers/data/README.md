This folder is written to by the admin panel (admin.html on this site, or
innovationearthprojects.org/admin). Each "Save & publish" commits one file:

    papers/data/<slug>.md   — YAML front matter + markdown article body

build.py discovers every file here automatically, so publishing a paper
never requires editing HTML or JSON. Delete = remove the file here and
let the build action refresh feed.json.
