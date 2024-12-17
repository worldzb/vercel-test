import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";
const mappings = {
    O_TIME: "发震时刻(UTC+8)",
    LOCATION_C: "参考位置",
    M: "震级(M)",
    EPI_LAT: "纬度(°)",
    EPI_LON: "经度(°)",
    EPI_DEPTH: "深度(千米)",
    SAVE_TIME: "录入时间",
};
export const handleRoute = async (_, noCache) => {
    const listData = await getList(noCache);
    const routeData = {
        name: "earthquake",
        title: "中国地震台",
        type: "地震速报",
        link: "https://news.ceic.ac.cn/",
        total: listData.data?.length || 0,
        ...listData,
    };
    return routeData;
};
const getList = async (noCache) => {
    const url = `https://news.ceic.ac.cn/speedsearch.html`;
    const result = await get({ url, noCache });
    const regex = /const newdata = (\[.*?\]);/s;
    const match = result.data.match(regex);
    const list = match && match[1] ? JSON.parse(match[1]) : [];
    return {
        ...result,
        data: list.map((v) => {
            const contentBuilder = [];
            const { NEW_DID, LOCATION_C, M } = v;
            for (const mappingsKey in mappings) {
                contentBuilder.push(`${mappings[mappingsKey]}：${v[mappingsKey]}`);
            }
            return {
                id: NEW_DID,
                title: `${LOCATION_C}发生${M}级地震`,
                desc: contentBuilder.join("\n"),
                timestamp: getTime(v["O_TIME"]),
                hot: undefined,
                url: `https://news.ceic.ac.cn/${NEW_DID}.html`,
                mobileUrl: `https://news.ceic.ac.cn/${NEW_DID}.html`,
            };
        }),
    };
};