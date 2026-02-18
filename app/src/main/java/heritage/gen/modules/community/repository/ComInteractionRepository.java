package heritage.gen.modules.community.repository;

import heritage.gen.modules.community.model.ComInteractionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ComInteractionRepository extends JpaRepository<ComInteractionEntity, Long> {

    Optional<ComInteractionEntity> findByUserIdAndPostIdAndType(Long userId, Long postId, String type);

    long countByPostIdAndType(Long postId, String type);
}
