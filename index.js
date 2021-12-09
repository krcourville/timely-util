import { remote } from "webdriverio";
import axios from "axios";
import { resolve } from "path";
import fs from "fs-extra";
import csv from "csv-parser";

const TIMELY_URL = "https://app.timelyapp.com/";
const TIMELY_API_URL = "https://app.timelyapp.com/CLIENT_ID/hours";
const TIMELY_LOGGEDIN_TITLE = "Hours – Timely";
const FIVE_MINUTES = 1000 * 60 * 5;
const ONE_SECOND = 1000;
const CSV_FILE = "my_time.csv";

(async () => {
  await main();
})();

async function main() {
  const browser = await remote({
    logLevel: "warn",
    capabilities: {
      browserName: "chrome",
    },
  });

  const timelyCookies = await getTimelyCookie(browser);
  const requestCookie = mapRequestCookie(timelyCookies);

  const url = await browser.getUrl();
  const clientId = parseClientId(url);
  const apiUrl = TIMELY_API_URL.replace("CLIENT_ID", clientId);
  const timely = new TimelyClient({ url: apiUrl, cookie: requestCookie });

  const dataFilePath = resolve(".", CSV_FILE);
  console.log("USING DATA FILE", dataFilePath);
  const entries = await parseDataFile(dataFilePath);

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    console.log(`SENDING ENTRY ${i + 1}:`, entry);
    await timely.addTimeEntry(entry);
  }

  await browser.closeWindow();
}

async function getTimelyCookie(browser) {
  await browser.url(TIMELY_URL);

  await browser.waitUntil(
    async () => {
      const title = await browser.getTitle();
      console.log("Please login to timely so that I can borrow some cookies..");
      return title === TIMELY_LOGGEDIN_TITLE;
    },
    {
      timeout: FIVE_MINUTES,
      interval: ONE_SECOND,
    }
  );

  return await browser.getCookies();
}

function parseClientId(url) {
  return url.split("/").find((part) => /^\d+$/.test(part));
}

function mapRequestCookie(timelyCookies) {
  return timelyCookies
    .map(({ name, value }) => [name, value].join("="))
    .join("; ");
}

function parseDataFile(filepath) {
  return new Promise((resolve) => {
    const result = [];
    fs.createReadStream(filepath)
      .pipe(csv())
      .on("data", (data) => {
        result.push(data);
      })
      .on("end", () => {
        resolve(result);
      });
  });
}

class TimelyClient {
  constructor({ url, cookie }) {
    this.url = url;
    this.cookie = cookie;
  }

  async addTimeEntry(data) {
    try {
      const event = {
        event: data,
      };
      const res = await axios.post(this.url, event, {
        withCredentials: true,
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          cookie: this.cookie,
        },
      });
      console.log("RESPONSE", res.data);
    } catch (error) {
      console.log(
        "ERROR_SENDING_REQUEST",
        error.response.status,
        error.response.statusText,
        error.response.data
      );
    }
  }
}
