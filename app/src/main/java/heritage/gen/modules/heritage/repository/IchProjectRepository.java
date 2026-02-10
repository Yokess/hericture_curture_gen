package heritage.gen.modules.heritage.repository;

import heritage.gen.modules.heritage.model.IchProjectEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * 非遗项目 Repository
 */
public interface IchProjectRepository
        extends JpaRepository<IchProjectEntity, Long>, JpaSpecificationExecutor<IchProjectEntity> {

    /**
     * 检查项目官方ID是否已存在
     */
    boolean existsByOfficialId(String officialId);

    /**
     * 根据类别分页查询
     */
    Page<IchProjectEntity> findByCategory(String category, Pageable pageable);

    /**
     * 根据地区分页查询
     */
    Page<IchProjectEntity> findByLocationContaining(String location, Pageable pageable);

    /**
     * 根据类别和地区分页查询
     */
    Page<IchProjectEntity> findByCategoryAndLocationContaining(
            String category,
            String location,
            Pageable pageable);

    /**
     * 搜索项目 (名称或描述包含关键词)
     */
    @Query("SELECT p FROM IchProjectEntity p WHERE p.name LIKE %:keyword% OR p.description LIKE %:keyword%")
    Page<IchProjectEntity> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * 获取所有类别
     */
    @Query("SELECT DISTINCT p.category FROM IchProjectEntity p WHERE p.category IS NOT NULL ORDER BY p.category")
    List<String> findAllCategories();

    /**
     * 获取所有地区
     */
    @Query("SELECT DISTINCT p.location FROM IchProjectEntity p WHERE p.location IS NOT NULL ORDER BY p.location")
    List<String> findAllLocations();
}
