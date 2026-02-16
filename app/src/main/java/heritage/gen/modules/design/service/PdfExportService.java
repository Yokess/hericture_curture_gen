package heritage.gen.modules.design.service;

import com.itextpdf.html2pdf.HtmlConverter;
import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.html2pdf.resolver.font.DefaultFontProvider;
import com.itextpdf.io.font.FontProgram;
import com.itextpdf.io.font.FontProgramFactory;
import com.itextpdf.layout.font.FontProvider;
import com.itextpdf.kernel.colors.ColorConstants;
import heritage.gen.modules.design.model.ArtifactEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.util.Map;

@Slf4j
@Service
public class PdfExportService {

    public byte[] generateDesignPdf(ArtifactEntity entity) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            String html = buildHtml(entity);
            //   1: 创建转换属性
            ConverterProperties properties = new ConverterProperties();
            //2: 创建字体提供者
            FontProvider fontProvider = new DefaultFontProvider(false, false, false);
            // 3: 加载字体文件 (确保 src/main/resources/fonts/SimSun.ttf 存在)
            // 也可以使用绝对路径测试: "C:/Windows/Fonts/simsun.ttc"
            // 生产环境建议读取流:
            byte[] fontBytes = this.getClass().getClassLoader().getResourceAsStream("fonts/NotoSansSC-VariableFont_wght.ttf").readAllBytes();
            FontProgram fontProgram = FontProgramFactory.createFont(fontBytes);
            fontProvider.addFont(fontProgram);
            properties.setFontProvider(fontProvider);
            HtmlConverter.convertToPdf(html, baos,properties);

            return baos.toByteArray();
        } catch (Exception e) {
            log.error("PDF生成失败", e);
            throw new RuntimeException("PDF生成失败: " + e.getMessage(), e);
        }
    }

    private String buildHtml(ArtifactEntity entity) {
        StringBuilder html = new StringBuilder();

        html.append("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: "Microsoft YaHei", "SimSun", sans-serif; 
                        color: #2c3e50;
                        line-height: 1.8;
                        background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
                    }
                    .page { 
                        width: 210mm; 
                        min-height: 297mm; 
                        padding: 20mm;
                        margin: 10px auto;
                        background: white;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        padding-bottom: 20px;
                        border-bottom: 3px solid #8B4513;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        font-size: 32px;
                        color: #8B4513;
                        margin-bottom: 10px;
                        letter-spacing: 4px;
                    }
                    .header .subtitle {
                        font-size: 14px;
                        color: #999;
                        letter-spacing: 2px;
                    }
                    .product-image {
                        text-align: center;
                        margin: 20px 0;
                        padding: 20px;
                        background: linear-gradient(145deg, #fafafa, #f0f0f0);
                        border-radius: 12px;
                    }
                    .product-image img {
                        max-width: 70%;
                        border-radius: 8px;
                        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                    }
                    .section {
                        margin: 25px 0;
                        padding: 20px;
                        background: #fff;
                        border-left: 4px solid #D4AF37;
                        border-radius: 0 8px 8px 0;
                    }
                    .section-title {
                        font-size: 18px;
                        color: #8B4513;
                        margin-bottom: 15px;
                        padding-bottom: 8px;
                        border-bottom: 1px solid #eee;
                        display: flex;
                        align-items: center;
                    }
                    .section-title::before {
                        content: "◆";
                        margin-right: 10px;
                        color: #D4AF37;
                    }
                    .section-content {
                        font-size: 13px;
                        color: #555;
                        text-align: justify;
                    }
                    .highlight-box {
                        background: linear-gradient(135deg, #FFF8E7 0%, #FFF0D0 100%);
                        padding: 15px 20px;
                        border-radius: 8px;
                        margin: 10px 0;
                        border: 1px solid #D4AF37;
                    }
                    .card-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 15px;
                        margin: 15px 0;
                    }
                    .card {
                        background: linear-gradient(145deg, #f8f9fa, #e9ecef);
                        padding: 15px;
                        border-radius: 8px;
                        border-left: 3px solid #8B4513;
                    }
                    .card-title {
                        font-size: 12px;
                        color: #8B4513;
                        font-weight: bold;
                        margin-bottom: 8px;
                    }
                    .card-content {
                        font-size: 11px;
                        color: #666;
                    }
                    .color-list {
                        display: flex;
                        gap: 15px;
                        flex-wrap: wrap;
                        margin: 15px 0;
                    }
                    .color-item {
                        text-align: center;
                    }
                    .color-swatch {
                        width: 50px;
                        height: 50px;
                        border-radius: 50%;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                        margin-bottom: 5px;
                        border: 3px solid white;
                    }
                    .color-name {
                        font-size: 10px;
                        color: #666;
                    }
                    .feature-list {
                        list-style: none;
                        padding: 0;
                    }
                    .feature-list li {
                        padding: 8px 0 8px 25px;
                        position: relative;
                        font-size: 12px;
                        border-bottom: 1px dashed #eee;
                    }
                    .feature-list li::before {
                        content: "✓";
                        position: absolute;
                        left: 0;
                        color: #D4AF37;
                        font-weight: bold;
                    }
                    .analysis-section {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e8f4f8 100%);
                        padding: 20px;
                        border-radius: 12px;
                        margin: 20px 0;
                    }
                    .analysis-title {
                        font-size: 16px;
                        color: #2A5B8C;
                        margin-bottom: 15px;
                        padding-bottom: 10px;
                        border-bottom: 2px solid #2A5B8C;
                    }
                    .two-column {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                    }
                    .metric {
                        display: flex;
                        justify-content: space-between;
                        padding: 10px;
                        background: white;
                        border-radius: 6px;
                        margin: 8px 0;
                    }
                    .metric-label {
                        color: #666;
                        font-size: 12px;
                    }
                    .metric-value {
                        color: #8B4513;
                        font-weight: bold;
                        font-size: 12px;
                    }
                    .risk-section {
                        background: #FFF5F5;
                        padding: 15px;
                        border-radius: 8px;
                        margin: 10px 0;
                        border-left: 3px solid #E74C3C;
                    }
                    .risk-title {
                        color: #E74C3C;
                        font-size: 13px;
                        font-weight: bold;
                        margin-bottom: 8px;
                    }
                    .risk-content {
                        font-size: 11px;
                        color: #666;
                    }
                    .footer {
                        text-align: center;
                        padding-top: 20px;
                        margin-top: 30px;
                        border-top: 1px solid #eee;
                        color: #999;
                        font-size: 10px;
                    }
                    .brand {
                        color: #8B4513;
                        font-weight: bold;
                    }
                    @media print {
                        .page { box-shadow: none; margin: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="page">
                """);
                   html.append("""
                         <div class="header">
                        <h1>%s</h1>
                        <div class="subtitle">AI 智能文创设计提案 · HERITAGE CULTURE</div>
                    </div>
            """.formatted(entity.getDesignName()));

        // 产品图片
        if (entity.getProductShotUrl() != null && !entity.getProductShotUrl().isBlank()) {
            html.append("""
                <div class="product-image">
                    <img src="%s" alt="产品效果图" />
                </div>
                """.formatted(entity.getProductShotUrl()));
        }

        // 设计理念
        if (entity.getDesignConcept() != null) {
            html.append("""
                <div class="section">
                    <div class="section-title">设计理念</div>
                    <div class="section-content highlight-box">%s</div>
                </div>
                """.formatted(entity.getDesignConcept()));
        }

        // 文化溯源
        if (entity.getConceptData() != null) {
            String culturalContext = (String) entity.getConceptData().get("culturalContext");
            if (culturalContext != null) {
                html.append("""
                    <div class="section">
                        <div class="section-title">文化溯源</div>
                        <div class="section-content">%s</div>
                    </div>
                    """.formatted(culturalContext));
            }
        }

        // 形态规格
        if (entity.getConceptData() != null) {
            String formFactor = (String) entity.getConceptData().get("formFactor");
            String dimensions = (String) entity.getConceptData().get("dimensions");
            if (formFactor != null) {
                html.append("""
                    <div class="section">
                        <div class="section-title">形态规格</div>
                        <div class="section-content">%s</div>
                        <div class="highlight-box" style="margin-top:10px;">📐 尺寸：%s</div>
                    </div>
                    """.formatted(formFactor, dimensions != null ? dimensions : ""));
            }
        }

        // 交互体验
        if (entity.getConceptData() != null) {
            String userInteraction = (String) entity.getConceptData().get("userInteraction");
            if (userInteraction != null) {
                html.append("""
                    <div class="section">
                        <div class="section-title">交互体验</div>
                        <div class="section-content">%s</div>
                    </div>
                    """.formatted(userInteraction));
            }
        }

        // 材质
        if (entity.getConceptData() != null) {
            var materials = entity.getConceptData().get("materials");
            if (materials != null) {
                html.append("""
                    <div class="section">
                        <div class="section-title">材质工艺</div>
                        <div class="card-grid">
                    """);
                
                String matStr = materials.toString();
                matStr = matStr.replace("[", "").replace("]", "");
                String[] matItems = matStr.split(", ");
                for (String item : matItems) {
                    if (!item.isBlank()) {
                        html.append("<div class=\"card\"><div class=\"card-content\">").append(item).append("</div></div>");
                    }
                }
                
                html.append("</div></div>");
            }
        }

        // 色彩
        if (entity.getConceptData() != null) {
            var colors = entity.getConceptData().get("colors");
            if (colors != null) {
                html.append("""
                    <div class="section">
                        <div class="section-title">色彩方案</div>
                        <div class="color-list">
                    """);
                
                String colorStr = colors.toString();
                // 解析 colors 格式
                java.util.regex.Pattern p = java.util.regex.Pattern.compile("\"hex\"\\s*:\\s*\"([^\"]+)\".*?\"name\"\\s*:\\s*\"([^\"]+)\"");
                java.util.regex.Matcher m = p.matcher(colorStr);
                while (m.find()) {
                    String hex = m.group(1);
                    String name = m.group(2);
                    html.append(String.format("""
                        <div class="color-item">
                            <div class="color-swatch" style="background:%s;"></div>
                            <div class="color-name">%s</div>
                        </div>
                        """, hex, name));
                }
                
                html.append("</div></div>");
            }
        }

        // 核心功能
        if (entity.getConceptData() != null) {
            var keyFeatures = entity.getConceptData().get("keyFeatures");
            if (keyFeatures != null) {
                html.append("""
                    <div class="section">
                        <div class="section-title">核心功能点</div>
                        <ul class="feature-list">
                    """);
                
                String featuresStr = keyFeatures.toString().replace("[", "").replace("]", "");
                String[] features = featuresStr.split(",");
                for (String feature : features) {
                    if (!feature.isBlank()) {
                        html.append("<li>").append(feature.replace("\"", "")).append("</li>");
                    }
                }
                
                html.append("</ul></div>");
            }
        }

        // 市场分析
        if (entity.getMarketAnalysis() != null) {
            var market = entity.getMarketAnalysis();
            html.append("""
                <div class="analysis-section">
                    <div class="analysis-title">📊 市场分析与商业定位</div>
                    <div class="two-column">
            """);
            
            String targetPersona = (String) market.get("targetPersona");
            String priceRange = (String) market.get("priceRange");
            String marketPositioning = (String) market.get("marketPositioning");
            
            if (targetPersona != null) {
                html.append(String.format("""
                    <div>
                        <div class="metric">
                            <span class="metric-label">目标客群</span>
                            <span class="metric-value">%s</span>
                        </div>
                    </div>
                    """, targetPersona.length() > 50 ? targetPersona.substring(0, 50) + "..." : targetPersona));
            }
            
            if (priceRange != null) {
                html.append(String.format("""
                    <div>
                        <div class="metric">
                            <span class="metric-label">定价区间</span>
                            <span class="metric-value">%s</span>
                        </div>
                    </div>
                    """, priceRange));
            }
            
            if (marketPositioning != null) {
                html.append(String.format("""
                    <div>
                        <div class="metric">
                            <span class="metric-label">市场定位</span>
                            <span class="metric-value">%s</span>
                        </div>
                    </div>
                    """, marketPositioning));
            }
            
            html.append("</div></div>");
        }

        // 技术可行性
        if (entity.getTechnicalFeasibility() != null) {
            var tech = entity.getTechnicalFeasibility();
            html.append("""
                <div class="analysis-section">
                    <div class="analysis-title">⚙️ 技术可行性与生产成本</div>
            """);

            Object complexityObj = tech.get("manufacturingComplexity");
            String complexity = complexityObj != null ? complexityObj.toString() : null;

            Object moqObj = tech.get("minOrderQuantity");
            String moq = moqObj != null ? moqObj.toString() : null;

            Object leadTimeObj = tech.get("leadTime");
            String leadTime = leadTimeObj != null ? leadTimeObj.toString() : null;
            
            if (complexity != null) {
                html.append(String.format("""
                    <div class="metric">
                        <span class="metric-label">制造复杂度</span>
                        <span class="metric-value">%s</span>
                    </div>
                    """, complexity));
            }
            
            if (moq != null) {
                html.append(String.format("""
                    <div class="metric">
                        <span class="metric-label">最小起订量</span>
                        <span class="metric-value">%s</span>
                    </div>
                    """, moq));
            }
            
            if (leadTime != null) {
                html.append(String.format("""
                    <div class="metric">
                        <span class="metric-label">预计交期</span>
                        <span class="metric-value">%s</span>
                    </div>
                    """, leadTime));
            }
            
            html.append("</div>");
        }

        // 风险评估
        if (entity.getRiskAssessment() != null) {
            var risk = entity.getRiskAssessment();
            html.append("""
                <div class="analysis-section">
                    <div class="analysis-title">⚠️ 风险评估与限制说明</div>
            """);
            
            var materialRisks = risk.get("materialRisks");
            if (materialRisks != null) {
                html.append("""
                    <div class="risk-section">
                        <div class="risk-title">材质风险</div>
                        <div class="risk-content">""")
                    .append(materialRisks.toString().replace("[", "").replace("]", ""))
                    .append("</div></div>");
            }
            
            var electronicRisks = risk.get("electronicRisks");
            if (electronicRisks != null) {
                html.append("""
                    <div class="risk-section">
                        <div class="risk-title">电子元件风险</div>
                        <div class="risk-content">""")
                    .append(electronicRisks.toString().replace("[", "").replace("]", ""))
                    .append("</div></div>");
            }
            
            String warranty = risk.get("warrantyPeriod") != null ? risk.get("warrantyPeriod").toString() : "";
            if (!warranty.isEmpty()) {
                html.append(String.format("""
                    <div class="metric">
                        <span class="metric-label">建议质保期</span>
                        <span class="metric-value">%s个月</span>
                    </div>
                    """, warranty));
            }
            
            html.append("</div>");
        }

        html.append("""
            <div class="footer">
                <p>Generated by <span class="brand">Heritage Culture</span> AI Design Platform</p>
                <p>© 2026 Heritage Culture. All rights reserved.</p>
            </div>
            </div>
            </body>
            </html>
            """);

        return html.toString();
    }
}
