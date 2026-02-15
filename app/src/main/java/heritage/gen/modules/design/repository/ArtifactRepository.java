package heritage.gen.modules.design.repository;

import heritage.gen.modules.design.model.ArtifactEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArtifactRepository extends JpaRepository<ArtifactEntity, Long> {

    @Query("SELECT a FROM ArtifactEntity a WHERE a.userId = :userId AND a.isDeleted = false ORDER BY a.createdAt DESC")
    List<ArtifactEntity> findByUserId(@Param("userId") Long userId);

    @Query("SELECT a FROM ArtifactEntity a WHERE a.userId = :userId AND a.isDeleted = false ORDER BY a.createdAt DESC")
    Page<ArtifactEntity> findByUserIdPage(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT a FROM ArtifactEntity a WHERE a.status = 'PUBLISHED' AND a.isDeleted = false ORDER BY a.createdAt DESC")
    List<ArtifactEntity> findPublished();

    @Query("SELECT a FROM ArtifactEntity a WHERE a.status = 'PUBLISHED' AND a.isDeleted = false ORDER BY a.viewCount DESC")
    List<ArtifactEntity> findPopular();

    @Query("SELECT a FROM ArtifactEntity a WHERE a.id = :id AND a.isDeleted = false")
    ArtifactEntity findByIdActive(@Param("id") Long id);
}
