declare namespace Bloodhound {
  interface BloodhoundOptions<T> {
    /**
     * Transforms a datum into an array of string tokens.
     *
     * @param datum Suggestion.
     * @returns An array of string tokens.
     */
    datumTokenizer: (datum: T) => string[];

    /**
     * Transforms a query into an array of string tokens.
     *
     * @param quiery Query.
     * @returns An array of string tokens.
     */
    queryTokenizer: (query: string) => string[];

    /**
     * If set to false, the Bloodhound instance will not be implicitly
     * initialized by the constructor function. Defaults to true.
     */
    initialize?: boolean;

    /**
     * Given a datum, returns a unique id for it.
     * Defaults to JSON.stringify. Note that it is highly recommended
     * to override this option.
     *
     * @param datum Suggestion.
     * @returns Unique id for the suggestion.
     */
    identify?: (datum: T) => number;

    /**
     * If the number of datums provided from the internal search index is
     * less than sufficient, remote will be used to backfill search
     * requests triggered by calling #search. Defaults to 5.
     */
    sufficient?: number;

    /**
     * A compare function used to sort data returned from the internal search index.
     *
     * @param a First suggestion.
     * @param b Second suggestion.
     * @returns Comparison result.
     */
    sorter?: (a: T, b: T) => number;

    /**
     * An array of data or a function that returns an array of data.
     * The data will be added to the internal search index when #initialize is called.
     */
    local?: T[] | (() => T[]);

    /**
     * Can be a URL to a JSON file containing an array of data or,
     * if more configurability is needed, a prefetch options hash.
     */
    prefetch?: string | PrefetchOptions<T>;

    /**
     * Can be a URL to fetch data from when the data provided by the internal
     * search index is insufficient or, if more configurability is needed,
     * a remote options hash.
     */
    remote?: string | RemoteOptions<T>;
  }

  /**
   * Prefetched data is fetched and processed on initialization. If the browser
   * supports local storage, the processed data will be cached there to prevent
   * additional network requests on subsequent page loads.
   *
   * WARNING: While it's possible to get away with it for smaller data sets,
   * prefetched data isn't meant to contain entire sets of data. Rather, it should
   * act as a first-level cache. Ignoring this warning means you'll run the risk
   * of hitting local storage limits.
   */
  interface PrefetchOptions<T> {
    /**
     * The URL prefetch data should be loaded from.
     */
    url: string;

    /**
     * If false, will not attempt to read or write to local storage and
     * will always load prefetch data from url on initialization. Defaults to true.
     */
    cache?: boolean;

    /**
     * The time (in milliseconds) the prefetched data should be cached in
     * local storage. Defaults to 86400000 (1 day).
     */
    ttl?: number;

    /**
     * The key that data will be stored in local storage under.
     * Defaults to value of url.
     */
    cacheKey?: string;

    /**
     * A string used for thumbprinting prefetched data. If this doesn't
     * match what's stored in local storage, the data will be refetched.
     */
    thumbprint?: string;

    /**
     * A function that provides a hook to allow you to prepare the settings
     * object passed to transport when a request is about to be made.
     * Defaults to the identity function.
     *
     * @param settings The default settings object created internally by the Bloodhound instance.
     * @returns A settings object.
     */
    prepare?: (settings: JQueryAjaxSettings) => JQueryAjaxSettings;

    /**
     * A function with the signature transform(response) that allows you to
     * transform the prefetch response before the Bloodhound instance operates
     * on it. Defaults to the identity function.
     *
     * @param response Prefetch response.
     * @returns Transform response.
     */
    transform?: (response: T) => T;
  }

  /**
   * Bloodhound only goes to the network when the internal search engine cannot
   * provide a sufficient number of results. In order to prevent an obscene
   * number of requests being made to the remote endpoint, requests are rate-limited.
   */
  interface RemoteOptions<T> {
    /**
     * The URL remote data should be loaded from.
     */
    url: string;

    /**
     * A function that provides a hook to allow you to prepare the settings
     * object passed to transport when a request is about to be made.
     * The function signature should be prepare(query, settings), where query
     * is the query #search was called with and settings is the default settings
     * object created internally by the Bloodhound instance. The prepare function
     * should return a settings object. Defaults to the identity function.
     *
     * @param query The query #search was called with.
     * @param settings The default settings object created internally by Bloodhound.
     * @returns A JqueryAjaxSettings object.
     */
    prepare?: (query: string, settings: JQueryAjaxSettings) => JQueryAjaxSettings;

    /**
     * A convenience option for prepare. If set, prepare will be a function
     * that replaces the value of this option in url with the URI encoded query.
     */
    wildcard?: string;

    /**
     * The method used to rate-limit network requests.
     * Can be either debounce or throttle. Defaults to debounce.
     */
    rateLimitby?: string;

    /**
     * The time interval in milliseconds that will be used by rateLimitBy.
     * Defaults to 300.
     */
    rateLimitWait?: number;

    /**
     * A function with the signature transform(response) that allows you to
     * transform the remote response before the Bloodhound instance operates on it.
     * Defaults to the identity function.
     *
     * @param response Prefetch response.
     * @returns Transform response.
     */
    transform?: (response: T) => T;

    /**
     * DEPRECATED: transform the remote response before the Bloodhound instance operates on it.
     * */
    filter?: (response: T) => T;

  }

  /**
  * Build-in tokenization methods.
  */
  interface Tokenizers {
    /**
     * Split a given string on whitespace characters.
     */
    whitespace(str: string): string[];

    /**
     * Split a given string on non-word characters.
     */
    nonword(str: string): string[];

    /**
     * Instances of the build-in tokenization methods.
     */
    obj: ObjTokenizer;
  }

  interface ObjTokenizer {
    /**
     * Split the string content of the given object attribute(s) on
     * whitespace characters.
     */
    whitespace(key: string | string[]): (obj: any) => string[];

    /**
     * Split the string content of the given object attribute(s) on non-word
     * characters.
     */
    nonword(key: string | string[]): (obj: any) => string[];
  }
}

/**
* Bloodhound is the typeahead.js suggestion engine. Bloodhound is robust,
* flexible, and offers advanced functionalities such as prefetching,
* intelligent caching, fast lookups, and backfilling with remote data.
*/
declare class Bloodhound<T> {
  /**
   * The constructor function.
   *
   * @constructor
   * @param options Options hash.
   */
  constructor(options: Bloodhound.BloodhoundOptions<T>);

  /**
   * Returns a reference to Bloodhound and reverts window.Bloodhound to its
   * previous value. Can be used to avoid naming collisions.
   */
  public static noConflict(): Bloodhound<any>;

  /**
   * The Bloodhound suggestion engine is token-based, so how datums and queries are tokenized plays a vital role in the quality of search results.
   * Specify how you want datums and queries tokenized.
   */
  public static tokenizers: Bloodhound.Tokenizers;

  /**
   * Kicks off the initialization of the suggestion engine. Initialization
   * entails adding the data provided by local and prefetch to the internal
   * search index as well as setting up transport mechanism used by remote.
   * Before #initialize is called, the #get and #search methods will effectively be no-ops.
   *
   * Note, unless the initialize option is false, this method is implicitly called by the constructor.
   *
   * After initialization, how subsequent invocations of #initialize behave depends on
   * the reinitialize argument. If reinitialize is falsy, the method will not execute the
   * initialization logic and will just return the same jQuery promise returned
   * by the initial invocation. If reinitialize is truthy, the method will behave
   * as if it were being called for the first time.
   *
   * @param reinitialize How subsequent invocations of #initialize will behave.
   * @returns jQuery promise.
   */
  public initialize(reinitialize?: boolean): JQueryPromise<T>;

  /**
   * Takes one argument, data, which is expected to be an array.
   * The data passed in will get added to the internal search index.
   *
   * @param data Data to be added to the internal search index.
   */
  public add(data: T[]): void;

  /**
   * Returns the data in the local search index corresponding to ids.
   *
   * @param ids Data ids.
   * @returns The corresponding data.
   */
  public get(ids: number[]): T[];

  /**
   * Returns the data that matches query. Matches found in the local search
   * index will be passed to the sync callback. If the data passed to sync
   * doesn't contain at least sufficient number of datums, remote data will
   * be requested and then passed to the async callback.
   *
   * @param query Query.
   * @param sync Sync callback
   * @param async Async callback.
   * @returns The data that matches query.
   */
  public search(query: string, sync: (datums: T[]) => void, async?: (datums: T[]) => void): T[];

  /**
   * Returns all items from the internal search index.
   */
  public all(): T[];

  /**
   * Clears the internal search index that's powered by local, prefetch, and #add.
   */
  public clear(): Bloodhound<T>;

  /**
   * If you're using prefetch, data gets cached in local storage in an effort to cut down on unnecessary network requests.
   * clearPrefetchCache offers a way to programmatically clear said cache.
   */
  public clearPrefetchCache(): Bloodhound<T>;

  /**
   * If you're using remote, Bloodhound will cache the 10 most recent responses in an effort to provide a better user experience.
   * clearRemoteCache offers a way to programmatically clear said cache.
   */
  public clearRemoteCache(): Bloodhound<T>;

  /*
   * DEPRECATED: wraps the suggestion engine in an adapter that is compatible with the typeahead jQuery plugin
   */
  public ttAdapter(): any;
}

declare module "bloodhound-js" {
  export = Bloodhound;
}