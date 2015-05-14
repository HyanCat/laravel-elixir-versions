# laravel-elixir-versions

## Description

This is the copy of `elixir-version`, but it supports multiple building version numbers.

You konw, In `laravel-elixir`, the `version` extension could be run only once.

But sometimes you have to run `mix.version` more than once.
So, it will.


## usage

```javascript

elixir(function (mix) {

	// some code before....
	
	mix.versions([xxx], 'path_xx');

	mix.versions([yyy], 'path_yy');
	
	// some code after.... //
});

```

