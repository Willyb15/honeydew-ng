class History {
    constructor ( $localStorage, $location ) {
        if (!$localStorage.history) {
            $localStorage.history = [];
        }

        this.history = $localStorage.history;
        this.$location = $location;
    }

    get entries () {
        // this removes the relationship between this.history and
        // $localStorage.history; thus, any subsequent invocations of
        // this.add or this.addCurrentLocation will be discareded
        // after page refresh.
        //
        // as a result, the "only" way to persist entries to the
        // $localStorage.history is to not start one's HD session by
        // visiting the homepage; going directly to a feature, phrase,
        // or set page will not call entries, and this.history will be
        // a reference to $localStorage.history.
        //
        // completely arbitrarily, this.remove will restore the
        // assocation between $localStorage.history and
        // this.history. it needs to go somewhere, but I don't want to
        // do it frequently since interacting with ngStorage can be
        // slow if the object is large. remove gets called
        // infrequently enough that it should hopefully be ok.
        this.history = this.history
            .filter( ( file, index, ary ) =>  ary.indexOf( file ) === index )
            .filter( (_, index ) => index < 10 );

        return this.history.map( ( item ) => {
            let href = item;
            let label = item.replace( /\/?(features|sets)\/?/, '' );
            return { href, label };
        });
    }

    add ( item ) {
        this.history.unshift( item );
    }

    addCurrentLocation( ) {
        let { $location } = this;
        this.add( $location.path() );
    }
}

angular.module('honeydew').service('History', History);
