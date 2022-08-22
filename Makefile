fmt:
	deno fmt --options-use-tabs --options-line-width 1000

fmt-commit:
	deno fmt --options-use-tabs --options-line-width 1000
	git add .
	git commit -m "reformat code"
