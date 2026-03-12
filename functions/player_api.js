const axios = require('axios');
const { parse } = require('iptv-playlist-parser');

exports.handler = async (event) => {
    const { username, password, action, category_id } = event.queryStringParameters;
    
    // CONFIGURAÇÃO: Cole aqui o link da sua lista M3U (do Drive ou link direto)
    const M3U_URL = "SUA_URL_AQUI_OU_LINK_DO_DRIVE";

    try {
        // Busca a lista M3U
        const response = await axios.get(M3U_URL);
        const playlist = parse(response.data);

        // LÓGICA DE SEPARAÇÃO
        // Separamos os itens por tipo baseados em padrões comuns de listas
        const liveStreams = playlist.items.filter(item => !item.name.includes("S0") && !item.name.includes("E0") && !item.group.title.toLowerCase().includes("filmes"));
        const vodStreams = playlist.items.filter(item => item.group.title.toLowerCase().includes("filmes") || item.group.title.toLowerCase().includes("cinema"));
        const seriesStreams = playlist.items.filter(item => item.name.match(/S\d{2}\s?E\d{2}/i) || item.group.title.toLowerCase().includes("series"));

        // Roteamento de Ações do Xtream Codes
        switch (action) {
            case "get_live_categories":
                return { statusCode: 200, body: JSON.stringify([{ category_id: "1", category_name: "Canais Importados" }]) };

            case "get_live_streams":
                const streams = liveStreams.map((item, index) => ({
                    num: index + 1,
                    name: item.name,
                    stream_id: index + 1,
                    stream_icon: item.tvg.logo,
                    category_id: "1",
                    direct_source: item.url
                }));
                return { statusCode: 200, body: JSON.stringify(streams) };

            case "get_vod_streams":
                const vods = vodStreams.map((item, index) => ({
                    num: index + 1,
                    name: item.name,
                    stream_id: index + 1,
                    stream_icon: item.tvg.logo,
                    category_id: "1",
                    container_extension: "mp4",
                    direct_source: item.url
                }));
                return { statusCode: 200, body: JSON.stringify(vods) };

            default:
                // Login inicial
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        user_info: { auth: 1, status: "Active", exp_date: "1735689600" },
                        server_info: { url: "seu-site.netlify.app", port: "80" }
                    })
                };
        }
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: "Erro ao processar lista M3U" }) };
    }
};
