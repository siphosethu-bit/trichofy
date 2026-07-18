import pathlib

path = pathlib.Path("src/App.jsx")
text = path.read_text()

old = '''      {!authLoading && (
        <button className="account-pill" onClick={() => go("/account")}>
          {user ? user.name.split(" ")[0] : "Sign in"}
        </button>
      )}
      <Button className="header-cta" onClick={() => go("/analysis")}>Begin analysis <Icon name="arrow" size={17} /></Button>
      <button className="menu-toggle"'''

new = '''      <div className="header-actions">
        {!authLoading && (
          <button className="account-pill" onClick={() => go("/account")}>
            {user ? user.name.split(" ")[0] : "Sign in"}
          </button>
        )}
        <Button className="header-cta" onClick={() => go("/analysis")}>Begin analysis <Icon name="arrow" size={17} /></Button>
      </div>
      <button className="menu-toggle"'''

count = text.count(old)
if count != 1:
    raise SystemExit(f"Expected 1 match, found {count}. File NOT changed - paste this error back to Claude.")

text = text.replace(old, new, 1)
path.write_text(text)
print("OK: wrapped header buttons in a flex container")
