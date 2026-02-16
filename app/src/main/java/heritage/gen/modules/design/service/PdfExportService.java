package heritage.gen.modules.design.service;

import com.itextpdf.html2pdf.HtmlConverter;
import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.html2pdf.resolver.font.DefaultFontProvider;
import com.itextpdf.io.font.FontProgram;
import com.itextpdf.io.font.FontProgramFactory;
import com.itextpdf.layout.font.FontProvider;
import heritage.gen.modules.design.model.ArtifactEntity;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
public class PdfExportService {

    private final TemplateEngine templateEngine;

    public PdfExportService(TemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
    }

    public byte[] generateDesignPdf(ArtifactEntity entity) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Context context = new Context();
            context.setVariable("entity", entity);
            context.setVariable("conceptData", entity.getConceptData());
            context.setVariable("market", entity.getMarketAnalysis());
            context.setVariable("tech", entity.getTechnicalFeasibility());
            context.setVariable("risk", entity.getRiskAssessment());

            prepareContextData(context, entity);

            String html = templateEngine.process("design-export", context);

            // 1: 创建转换属性
            ConverterProperties properties = new ConverterProperties();
            // 2: 创建字体提供者
            FontProvider fontProvider = new DefaultFontProvider(false, false, false);
            // 3: 加载字体文件 (确保 src/main/resources/fonts/SimSun.ttf 存在)
            // 也可以使用绝对路径测试: "C:/Windows/Fonts/simsun.ttc"
            // 生产环境建议读取流:
            byte[] fontBytes = this.getClass().getClassLoader().getResourceAsStream("fonts/NotoSansSC-VariableFont_wght.ttf").readAllBytes();
            FontProgram fontProgram = FontProgramFactory.createFont(fontBytes);
            fontProvider.addFont(fontProgram);
            properties.setFontProvider(fontProvider);
            
            HtmlConverter.convertToPdf(html, baos, properties);

            return baos.toByteArray();
        } catch (Exception e) {
            log.error("PDF生成失败", e);
            throw new RuntimeException("PDF生成失败: " + e.getMessage(), e);
        }
    }

    private void prepareContextData(Context context, ArtifactEntity entity) {
        if (entity.getConceptData() != null) {
            // Materials
            Object materials = entity.getConceptData().get("materials");
            if (materials != null) {
                context.setVariable("materialsList", parseList(materials.toString()));
            }

            // Colors
            Object colors = entity.getConceptData().get("colors");
            if (colors != null) {
                context.setVariable("colorsList", parseColors(colors.toString()));
            }

            // Features
            Object keyFeatures = entity.getConceptData().get("keyFeatures");
            if (keyFeatures != null) {
                context.setVariable("featuresList", parseList(keyFeatures.toString()));
            }
        }
        
        if (entity.getRiskAssessment() != null) {
             Object materialRisks = entity.getRiskAssessment().get("materialRisks");
             if (materialRisks != null) {
                 context.setVariable("materialRisksList", parseList(materialRisks.toString()));
             }
             
             Object electronicRisks = entity.getRiskAssessment().get("electronicRisks");
             if (electronicRisks != null) {
                 context.setVariable("electronicRisksList", parseList(electronicRisks.toString()));
             }
        }
    }

    private List<String> parseList(String raw) {
        String str = raw.replace("[", "").replace("]", "");
        if (str.isBlank()) return new ArrayList<>();
        return Arrays.stream(str.split(","))
                .map(s -> s.trim().replace("\"", ""))
                .filter(s -> !s.isBlank())
                .collect(Collectors.toList());
    }

    private List<ColorItem> parseColors(String raw) {
        List<ColorItem> list = new ArrayList<>();
        Pattern p = Pattern.compile("\"hex\"\\s*:\\s*\"([^\"]+)\".*?\"name\"\\s*:\\s*\"([^\"]+)\"");
        Matcher m = p.matcher(raw);
        while (m.find()) {
            list.add(new ColorItem(m.group(1), m.group(2)));
        }
        return list;
    }

    @Data
    public static class ColorItem {
        private final String hex;
        private final String name;
    }
}
