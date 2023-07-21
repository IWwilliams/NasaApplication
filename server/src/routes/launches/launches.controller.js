const {
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
} = require("../../models/launches.model");

const { getPagination } = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.launchDate ||
    !launch.rocket ||
    !launch.target
  ) {
    return res.status(400).json({ error: "Missing Required Launch Property" });
  }

  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res
      .status(400)
      .json({ error: "Date entered is not in the standard date format" });
  }

  await scheduleNewLaunch(launch);

  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const launchId = +req.params.id;
  if (!(await existsLaunchWithId(launchId))) {
    return res.status(404).json({ status: "Launch Not Found" });
  }
  const aborted = await abortLaunchById(launchId);
  if (!aborted) {
    return res.status(404).json({ error: "Launch Not Found" });
  }
  return res.status(200).json({ ok: true });
}
module.exports = { httpGetAllLaunches, httpAddNewLaunch, httpAbortLaunch };
