package heritage.gen.modules.design.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.html2pdf.HtmlConverter;
import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.html2pdf.resolver.font.DefaultFontProvider;
import com.itextpdf.io.font.FontProgram;
import com.itextpdf.io.font.FontProgramFactory;
import com.itextpdf.layout.font.FontProvider;
import heritage.gen.common.exception.BusinessException;
import heritage.gen.common.exception.ErrorCode;
import heritage.gen.modules.design.model.ArtifactEntity;
import heritage.gen.modules.design.model.DesignConcept;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
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
    private final ObjectMapper objectMapper;

    public PdfExportService(TemplateEngine templateEngine, ObjectMapper objectMapper) {
        this.templateEngine = templateEngine;
        this.objectMapper = objectMapper;
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
            InputStream fontStream = this.getClass().getClassLoader().getResourceAsStream("fonts/NotoSansSC-VariableFont_wght.ttf");
            if (fontStream == null) {
                throw new BusinessException(ErrorCode.EXPORT_PDF_FAILED, "字体资源缺失");
            }
            byte[] fontBytes = fontStream.readAllBytes();
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
            Object materials = entity.getConceptData().get("materials");
            List<DesignConcept.Material> materialsList = convertList(materials, new TypeReference<List<DesignConcept.Material>>() {});
            if (!materialsList.isEmpty()) {
                context.setVariable("materialsList", materialsList.stream()
                        .map(m -> {
                            String name = nullToEmpty(m.getName());
                            String finish = m.getFinish();
                            if (finish == null || finish.isBlank()) {
                                return name;
                            }
                            return name + "（" + finish + "）";
                        })
                        .collect(Collectors.toList()));
            }

            Object colors = entity.getConceptData().get("colors");
            List<DesignConcept.Color> colorsList = convertList(colors, new TypeReference<List<DesignConcept.Color>>() {});
            if (!colorsList.isEmpty()) {
                context.setVariable("colorsList", colorsList.stream()
                        .map(c -> new ColorItem(c.getHex(), c.getName()))
                        .collect(Collectors.toList()));
            }

            Object keyFeatures = entity.getConceptData().get("keyFeatures");
            List<String> featuresList = convertList(keyFeatures, new TypeReference<List<String>>() {});
            if (!featuresList.isEmpty()) {
                context.setVariable("featuresList", featuresList);
            }
        }
        
        if (entity.getRiskAssessment() != null) {
             Object materialRisks = entity.getRiskAssessment().get("materialRisks");
             List<String> materialRisksList = convertList(materialRisks, new TypeReference<List<String>>() {});
             if (!materialRisksList.isEmpty()) {
                 context.setVariable("materialRisksList", materialRisksList);
             }
             
             Object electronicRisks = entity.getRiskAssessment().get("electronicRisks");
             List<String> electronicRisksList = convertList(electronicRisks, new TypeReference<List<String>>() {});
             if (!electronicRisksList.isEmpty()) {
                 context.setVariable("electronicRisksList", electronicRisksList);
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

    private <T> List<T> convertList(Object value, TypeReference<List<T>> typeRef) {
        if (value == null) {
            return new ArrayList<>();
        }
        if (value instanceof List<?> list && list.isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.convertValue(value, typeRef);
        } catch (IllegalArgumentException e) {
            return new ArrayList<>();
        }
    }

    private String nullToEmpty(String v) {
        return v == null ? "" : v;
    }
}
