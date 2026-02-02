package heritage.gen.modules.heritage.repository;

import heritage.gen.modules.heritage.model.IchSuccessorEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 传承人 Repository
 */
public interface IchSuccessorRepository extends JpaRepository<IchSuccessorEntity, Long> {

    /**
     * 根据项目ID查询传承人列表
     */
    List<IchSuccessorEntity> findByProjectId(Long projectId);

    /**
     * 根据项目ID分页查询传承人
     */
    Page<IchSuccessorEntity> findByProjectId(Long projectId, Pageable pageable);

    /**
     * 统计项目的传承人数量
     */
    Integer countByProjectId(Long projectId);

    /**
     * 根据姓名搜索
     */
    Page<IchSuccessorEntity> findByNameContaining(String name, Pageable pageable);
}
