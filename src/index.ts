import Bloodhound from 'bloodhound-js';

interface MinifiedSearchRecord {
  // types package name
  t: string;
  // globals
  g: string[];
  // modules
  m: string[];
  // project name
  p: string;
  // library name
  l: string;
  // downloads in the last month from NPM
  d: number;
}

const searchIndexUrl = "https://typespublisher.blob.core.windows.net/typespublisher/data/search-index-min.json";

function createEngine() {
  let query = "";
  return new Bloodhound({

    // See https://github.com/twitter/typeahead.js/blob/master/doc/bloodhound.md#options
    prefetch: searchIndexUrl,
    datumTokenizer: (entry: MinifiedSearchRecord) => {
      return [entry.l, entry.p, entry.t].concat(entry.g).concat(entry.m);
    },
    queryTokenizer: (input: string) => {
      query = input;
      return [input];
    },
    identify: (e: any) => <any>e.t,
    sorter: (x: any, y: any) => {
      // TODO: Include edit distance as additional weighting factor
      // Direct matches should be ranked higher, else rank on basis of download count
      if (x.t === query || x.t === (query + "js") || x.t === (query + ".js") || x.t === (query + "-js")) {
        return -1;
      }

      if (y.t === query || y.t === (query + "js") || y.t === (query + ".js") || y.t === (query + "-js")) {
        return 1;
      }

      return y.d - x.d;
    }
  });
}

function searchForTypes(searchTerm: string) {
  return new Promise<{ packageName: string; url: string }[]>(async (resolve, reject) => {
    try {
      const engine = createEngine();
      await engine.initialize();
      engine.search(searchTerm, (d) => {
        const data = d.map(x => ({
          packageName: `@types/${x.t}`,
          url: x.p,
        }));

        resolve(data)
      });
    } catch (e) { reject(e) }
  });
}

async function main() {
  const [searchTerm] = process.argv.slice(2);
  if (!searchTerm) {
    console.warn('No search term found!');
  }

  const data = await searchForTypes(searchTerm);
  data.forEach((d) => {
    console.log(`► ${d.packageName} (${d.url})`)
  });
}

main();